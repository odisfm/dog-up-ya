import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import {
    EC2Client,
    DescribeInstancesCommand,
    RunInstancesCommand,
    TerminateInstancesCommand,
    DescribeImagesCommand,
    _InstanceType,
    ResourceType,
    ShutdownBehavior
} from "@aws-sdk/client-ec2";
import type {CurrentRoundResponse, RoundResponse} from "@footy-scores/shared/src/types/apiResponses";
import {differenceInMinutes} from "date-fns";
// @ts-ignore
import userDataScript from '../../scripts/watcher-user-data.sh'

type EventType = {
    force?: boolean,
    ec2InstanceType: string,
    securityGroupId: string,
    subnetId: string,
}

export const handler = async (event: EventType) => {

    const START_TIME_WINDOW = 60 // minutes

    const computeClient = new EC2Client({region: 'ap-southeast-4'});
    const secretsClient = new SecretsManagerClient({});

    const terminateInstance = async (instanceId: string) => {
        const command = new TerminateInstancesCommand({
            InstanceIds: [instanceId]
        });

        const response = await computeClient.send(command);
        console.log(`Terminated instance ${instanceId}`)
        return response.TerminatingInstances;
    };

    const {SecretString} = await secretsClient.send(
        new GetSecretValueCommand({SecretId: 'dog-up-ya-app-server-env'})
    )
    const secrets = JSON.parse(SecretString!)

    const apiUrl = secrets.VITE_API_URL

    const currentTimeDetails: CurrentRoundResponse = await (async () => {
        const response = await fetch(`${apiUrl}/round/current`)
        if (!response.ok) {
            throw new Error(`Didn't get current round response!`)
        }
        const json = await response.json()
        if (json.error) {
            throw new Error(json.error)
        }
        const data: CurrentRoundResponse = json.data
        return data
    })()

    const roundData: RoundResponse = await (async () => {
        const url = `${apiUrl}/round/${currentTimeDetails.season}/${currentTimeDetails.roundNum}`
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Didn't get response from ${url} !`)
        }
        const json = await response.json()
        if (json.error) {
            throw new Error(json.error)
        }
        const data: RoundResponse = json.data
        return data
    })()

    const gamesData = roundData.games

    let gameIsBeingPlayed = false
    let gameWillStartSoon = false
    const now = new Date()

    for (const game of gamesData) {
        if (game.timeString === "Full Time") {
            continue
        } else if (game.timeString !== null) {
            gameIsBeingPlayed = true
            break
        }

        const startTime = new Date(game.unixTime * 1000)
        const minutesToStartTime = differenceInMinutes(startTime, now)
        if (minutesToStartTime <= START_TIME_WINDOW) {
            gameWillStartSoon = true
            break
        }
    }

    const needsWatchServer = gameIsBeingPlayed || gameWillStartSoon

    const describeInstancesInput = {
        Filters: [
            {
                Name: "tag:app",
                Values: ["dog-up-ya"]
            },
            {
                Name: "tag:Name",
                Values: ["dog-up-ya-watch-server*"]
            }
        ]
    }

    const command = new DescribeInstancesCommand(describeInstancesInput);
    const response = await computeClient.send(command);
    const activeInstances = response.Reservations!
        .flatMap(r => r.Instances ?? [])
        .filter(i => !["terminated", "shutting-down"].includes(i.State?.Name ?? ""));

    if (activeInstances.length === 0) {
        if (needsWatchServer || event.force) {
            const describeImagesCommand = new DescribeImagesCommand({
                Owners: ["amazon"],
                Filters: [
                    {
                        Name: "name",
                        Values: ["al2023-ami-2023.*-x86_64"]
                    }
                ]
            })

            const response = await computeClient.send(describeImagesCommand);

            const mostRecentAmi = response.Images!
                .sort((a, b) => new Date(b.CreationDate!).getTime() - new Date(a.CreationDate!).getTime())[0];

            const instanceCreateOptions = {
                ImageId: mostRecentAmi.ImageId,
                InstanceType: event.ec2InstanceType as _InstanceType,
                MinCount: 1,
                MaxCount: 1,
                AssociatePublicIpAddress: true,
                IamInstanceProfile: {
                    Name: "dog-up-ya-app-server"
                },
                SecurityGroupIds: [event.securityGroupId],
                SubnetId: event.subnetId,
                InstanceInitiatedShutdownBehavior: ShutdownBehavior.terminate,
                Monitoring: { Enabled: true },
                UserData: userDataScript,

                TagSpecifications: [
                    {
                        ResourceType: ResourceType.instance,
                        Tags: [
                            { Key: "app", Value: "dog-up-ya" },
                            {
                                Key: "Name",
                                Value: `dog-up-ya-watch-server-${new Date().toISOString().slice(5, 16).replace(/[-T:]/g, "")}`
                            }
                        ]
                    }
                ]

            }

            const runInstancesCommand = new RunInstancesCommand(instanceCreateOptions)
            const result = await computeClient.send(runInstancesCommand);

            console.log("Done!")
            console.log(result)
        }

    } else {
        if (!needsWatchServer) {
            for (const instance of activeInstances) {
                const id = instance!.InstanceId!
                await terminateInstance(id)

            }
        }
    }
}
