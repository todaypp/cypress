// The type declarations for Cypress Logs & the corresponding configuration permutations
declare namespace Cypress {
  interface Cypress extends Cypress {
    log(options: Partial<LogConfig | InternalLogConfig>): Log | undefined
  }

  interface Log extends Log {
    _hasInitiallyLogged: boolean
    get<K extends keyof InternalLogConfig>(attr: K): InternalLogConfig[K]
    get(): InternalLogConfig
    set<K extends keyof LogConfig | InternalLogConfig>(key: K, value: LogConfig[K]): InternalLog
    set(options: Partial<LogConfig | InternalLogConfig>)
    groupEnd(): void
  }

  type ReferenceAlias = {
    cardinal: number
    name: string
    ordinal: string
  }

  type Snapshot = {
    body?: {get: () => any}
    htmlAttrs?: {[key: string]: any}
    name?: string
  }

  type ConsoleProps = {
    Command?: string
    Snapshot?: string
    Elements?: number
    Selector?: string
    Yielded?: HTMLElement
    Event?: string
    Message?: string
    actual?: any
    expected?: any
    Method?: any
    URL?: any
    Status?: any
    'Route Matcher'?: any
    'Static Response'?: any
    Alias?: any
  }

  type RenderProps = {
    indicator?: 'aborted' | 'pending' | 'successful' | 'bad'
    message?: string
  }

  interface InternalLogConfig {
    alias?: string
    aliasType?: 'agent' | 'route' | 'primitive' | 'dom' | undefined
    browserPreRequest?: any
    callCount?: number
    chainerId?: string
    commandName?: string
    // provide the content to display in the dev tool's console when a log is
    // clicked from the Reporter's Command Log
    consoleProps?: () => ConsoleProps | ConsoleProps
    coords?: {
      left: number
      leftCenter: number
      top: number
      topCenter: number
      x: number
      y: number
    }
    count?: number
    // the name override for display purposes only
    displayName?: string
    // the JQuery element for the command. This will highlight the command
    // in the main window when debugging
    $el?: JQuery | string
    end?: boolean
    ended?: boolean
    err?: Error
    error?: Error
    // whether or not the generated log was an event or command
    event?: boolean
    expected?: string
    functionName?: string
    // whether or not to start a new log group
    groupStart?: boolean
    // whether or not the log should display in the reporter
    hidden?: boolean
    hookId?: number
    id?: string
    // defaults to command
    instrument?: 'agent' | 'command' | 'route'
    // whether or not the xhr route had a corresponding response stubbed out
    isStubbed?: boolean
    // additional information to include in the log if not overridden
    // the render props message
    // defaults to command arguments for command instrument
    message?: string | Array<string> | any[]
    method?: string
    // name of the log
    name?: string
    numElements?: number
    // the number of xhr responses that occurred. This is only applicable to
    // logs defined with instrument=route
    numResponses?: number
    referencesAlias?: ReferenceAlias[]
    renderProps?: () => RenderProps | RenderProps
    response?: string | object
    selector?: any
    // session information to associate with the log and be added to the session instrument panel
    sessionInfo?: {
      id: string
      data: {
        cookies?: Array<Cypress.Cookie> | null
        localStorage?: Array<LocalStorage> | null
      }
    }
    // whether or not to collect snapshots for the command
    snapshot?: boolean
    snapshots?: []
    state?: 'failed' | 'passed' | 'pending' // representative of Mocha.Runnable.constants (not publicly exposed by Mocha types)
    status?: number
    testCurrentRetry?: number
    testId?: string
    // timeout of the group command - defaults to defaultCommandTimeout
    timeout?: number
    // the timestamp of when the log was updated
    timestamp?: number
    // the type of log
    //   system - log generated by Cypress
    //   parent - log generated by Command
    //   child  - log generated by Chained Command
    type?: 'system' | 'parent' | 'child' | ((current: State['state']['current'], subject: State['state']['subject']) => 'parent' | 'child')
    url?: string
    viewportHeight?: number
    viewportWidth?: number
    // whether or not the subject is visible on the dom
    visible?: boolean
    // the timestamp of when the command started
    wallClockStartedAt?: string
  }
}