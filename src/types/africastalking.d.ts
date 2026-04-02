declare module "africastalking" {
  interface AfricastalkingOptions {
    apiKey: string;
    username: string;
  }

  interface SMSInstance {
    send(options: { to: string[]; message: string; from?: string }): Promise<unknown>;
  }

  interface AfricastalkingInstance {
    SMS: SMSInstance;
  }

  function Africastalking(options: AfricastalkingOptions): AfricastalkingInstance;
  export = Africastalking;
}
