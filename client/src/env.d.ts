declare const __COMMIT_HASH__: string
type UmamiType = {
    track: (eventName: string, data?: Record<never, never>) => void,

}
declare const umami: UmamiType