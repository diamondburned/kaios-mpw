<script lang="ts">
  import "#/sakura.scss";

  import * as worker from "#/lib/worker.js";
  import * as emojihash from "#/lib/emojihash.js";
  import * as persistent from "#/lib/persistent.js";

  import Loading from "#/components/Loading.svelte";
  import Worker from "#/lib/generator-worker.js?worker";

  const generatorWorker = new worker.Sender(new Worker());

  let username = persistent.writable("username", "");
  let knownDomains = persistent.writable<string[]>("knownDomains", []);
  let lastPasswordHash = persistent.writable("lastPasswordHash", "");

  $: state = {
    username: $username,
    password: "",
    domain: "",
    strength: "maximum",
    generation: 1,
  };

  $: passwordHash = emojihash.hash(state.password, 2);

  let generating: Promise<string | null> = Promise.resolve(null);
  let password: string | null = null;
  let reveal = false;

  function generate() {
    $lastPasswordHash = passwordHash;
    $knownDomains = [...new Set([state.domain, ...$knownDomains])];
    password = "";

    generating = generatorWorker.send("generate", state);
    generating.then((p) => (password = p));
  }
</script>

<main class="container">
  <h1>mpw</h1>
  <section id="generation">
    <form id="MasterPassword">
      <label for="username">Username</label>
      <input type="text" id="username" bind:value={state.username} />

      <label for="password">
        Password
        {#if state.password}
          <span id="emoji-pw">
            {#if passwordHash != $lastPasswordHash}<small>(new)</small>{/if}
            {passwordHash}
          </span>
        {/if}
      </label>
      <input type="password" id="password" bind:value={state.password} />

      <label for="domain">Domain</label>
      <input type="text" id="domain" list="domains" bind:value={state.domain} />
      <datalist id="domains">
        {#each $knownDomains as domain}
          <option value={domain} />
        {/each}
      </datalist>

      <label for="strength">Strength</label>
      <select id="strength" bind:value={state.strength}>
        <option value="maximum">Maximum</option>
        <option value="long">Long</option>
        <option value="medium">Medium</option>
        <option value="basic">Basic</option>
        <option value="short">Short</option>
        <option value="pin">PIN</option>
        <option value="name">Name</option>
        <option value="phrase">Phrase</option>
      </select>

      <label for="generation">Generation</label>
      <input type="number" id="generation" bind:value={state.generation} />

      <br />
      <button
        type="button"
        on:click={generate}
        disabled={!state.username || !state.password || !state.domain}
      >
        ⚙ Generate
      </button>
      {#await generating}
        <Loading />
      {/await}
    </form>
  </section>

  {#if password}
    <section id="password">
      <h3>Password</h3>
      <p>
        <code>
          {#if reveal}
            {password}
          {:else}
            {password.replace(/./g, "*")}
          {/if}
        </code>
        <label id="reveal">
          (<input type="checkbox" bind:checked={reveal} /> reveal)
        </label>
        <button
          type="button"
          on:click={() => navigator.clipboard.writeText(password || "")}
          disabled={!password}
          aria-label="Copy password to clipboard"
        >
          🗐 Copy to clipboard
        </button>
      </p>
    </section>
  {/if}
</main>

<style>
  #password button {
    display: block;
  }
  #emoji-pw {
    float: right;
  }
  #reveal {
    display: inline-block;
  }
  #MasterPassword {
    max-width: 250px;
  }
  #MasterPassword input,
  #MasterPassword label,
  #MasterPassword select {
    width: 100%;
  }
</style>
