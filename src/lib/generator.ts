import * as masterpassx from "masterpassx-core";

export interface State {
  username: string;
  password: string;
  domain: string;
  strength: string;
  generation: number;
}

export class Generator {
  private last?: State;
  private key?: any;
  private seed?: any;

  constructor() {}

  async generate(current: State): Promise<string | null> {
    if (!current.username || !current.password || !current.domain) {
      return null;
    }

    if (!current.strength) current.strength = "maximum";
    if (!current.generation) current.generation = 1;

    if (
      !this.key ||
      !this.last ||
      this.last.username != current.username ||
      this.last.password != current.username
    ) {
      this.key = await masterpassx.createKey(
        current.username,
        current.password
      );
      this.seed = undefined;
    }

    if (
      !this.seed ||
      !this.last ||
      this.last.domain != current.domain ||
      this.last.generation != current.generation
    ) {
      this.seed = await masterpassx.createSeed(
        this.key,
        current.domain,
        current.generation
      );
    }

    this.last = { ...current };
    return masterpassx.createPassword(this.seed, current.strength);
  }
}
