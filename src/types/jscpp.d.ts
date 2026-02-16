declare module "JSCPP" {
  interface JSCPPConfig {
    stdio?: {
      write?: (s: string) => void;
    };
    unsigned_overflow?: "error" | "warn" | "ignore";
    maxTimeout?: number;
  }

  interface JSCPPRuntime {
    exitCode: number;
  }

  const JSCPP: {
    run(code: string, input: string, config?: JSCPPConfig): JSCPPRuntime;
  };

  export default JSCPP;
}
