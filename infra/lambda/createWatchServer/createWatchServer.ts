import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import {
    EC2Client,
    DescribeInstancesCommand,
    DescribeSecurityGroupsCommand,
    DescribeSubnetsCommand,
    RunInstancesCommand,
    RunInstancesCommandOutput,
    TerminateInstancesCommand,
    TerminateInstancesCommandOutput,
    DescribeImagesCommand,
    _InstanceType,
    ResourceType,
    ShutdownBehavior,
    Instance,
    InstanceStateChange
} from "@aws-sdk/client-ec2";
import type {CurrentRoundResponse, RoundResponse} from "@footy-scores/shared/src/types/apiResponses";
import {differenceInMinutes} from "date-fns";
// @ts-ignore
import userDataScript from './watcher-user-data.sh'

type EventType = {
    force?: boolean,
    ec2InstanceType: string,
}

type SuccessResponse = {
    message: string | null,
    createdInstances: Instance[],
    terminatedInstances: string[],
    existingInstances?: Instance[],
}

export const handler = async (event: EventType) => {

    const START_TIME_WINDOW = 60 // minutes

    const computeClient = new EC2Client({region: 'ap-southeast-4'});
    const secretsClient = new SecretsManagerClient({});

    const terminateInstance = async (instanceId: string): Promise<TerminateInstancesCommandOutput> => {
        const command = new TerminateInstancesCommand({
            InstanceIds: [instanceId]
        });

        const response: TerminateInstancesCommandOutput = await computeClient.send(command);
        console.log(`Terminated instance ${instanceId}`)
        return response;
    };

    const {SecretString} = await secretsClient.send(
        new GetSecretValueCommand({SecretId: 'dog-up-ya-app-server-env'})
    )
    const secrets = JSON.parse(SecretString!)

    const apiUrl = secrets.VITE_API_URL

    const currentTimeDetails: CurrentRoundResponse = await (async () => {
        const response = await fetch(`${apiUrl}/round/current`)
        if (!response.ok) {
            const text = await response.text();
            console.error(response.status, text);
            console.error(apiUrl)
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
    let minutesToNearestGame: number | null = null
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
        if (minutesToNearestGame === null || minutesToStartTime < minutesToNearestGame) {
            minutesToNearestGame = minutesToStartTime
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

            const sgName = "dog-up-ya_server_sg"
            const sgResponse = await computeClient.send(new DescribeSecurityGroupsCommand({
                Filters: [
                    {
                        Name: "Name",
                        Values: [sgName]
                    }
                ]
            }))
            if (sgResponse.SecurityGroups === undefined) {
                throw new Error(`No security group called ${sgName}`)
            }
            const securityGroup = sgResponse.SecurityGroups[0]

            const subnetName = "subnet-dog-up-ya-a"
            const subnetResponse = await computeClient.send(new DescribeSubnetsCommand({
                Filters: [
                    {
                        Name: "Name",
                        Values: [subnetName]
                    }
                ]
            }))
            if (subnetResponse.Subnets === undefined) {
                throw new Error(`No subnet found called ${subnetName}`)
            }
            const subnet = subnetResponse.Subnets[0]

            const instanceCreateOptions = {
                ImageId: mostRecentAmi.ImageId,
                InstanceType: event.ec2InstanceType as _InstanceType,
                MinCount: 1,
                MaxCount: 1,
                NetworkInterfaces: [
                    {
                        DeviceIndex: 0,
                        SubnetId: subnet.SubnetId,
                        Groups: [securityGroup.GroupId!],
                        AssociatePublicIpAddress: true
                    }
                ],
                IamInstanceProfile: {
                    Name: "dog-up-ya-app-server"
                },
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
            const result: RunInstancesCommandOutput = await computeClient.send(runInstancesCommand);

            console.log("Done!")
            console.log(result)

            return {createdInstances: result.Instances, terminatedInstances: [], message: null} as SuccessResponse

        } else {
            let message = ""
            if (minutesToNearestGame) {
                message = `Nearest game in ${minutesToNearestGame} minutes (window ${START_TIME_WINDOW})`
            } else {
                message = `No more games this round`
            }
            return {createdInstances: [], terminatedInstances: [], existingInstances: [], message} as SuccessResponse
        }

    } else {
        if (!needsWatchServer) {
            const terminatedIds: string[] = []
            for (const instance of activeInstances) {
                const id = instance!.InstanceId!
                const response = await terminateInstance(id)
                response.TerminatingInstances!.forEach((stateChange: InstanceStateChange) => {
                    terminatedIds.push(stateChange.InstanceId || "instance ID unavailable")
                })
            }
            return {createdInstances: [], terminatedInstances: terminatedIds, message: null} as SuccessResponse
        } else {
            let message = ''
            if (gameIsBeingPlayed) {
                message = "Game is live now."
            } else if (minutesToNearestGame) {
                message = `Game starting in ${minutesToNearestGame} minutes.`
            }
            return {
                createdInstances: [],
                terminatedInstances: [],
                existingInstances: activeInstances,
                message: `No change to instances: ${message}`
            } as SuccessResponse
        }
    }
}
