import { Generator, State } from "#/lib/generator.js";
import type { MessageType, ReplyType } from "#/lib/worker.js";

export type Message = MessageType<"generate", State>;
export type Reply = string | null;

const generator = new Generator();

function send(reply: ReplyType<Reply>) {
  postMessage(reply);
}

onmessage = async (ev: MessageEvent<any>) => {
  const msg = ev.data as Message;
  if (!msg.id) return;
  try {
    switch (msg.type) {
      case "generate":
        const password = await generator.generate(msg.data);
        send({
          id: msg.id,
          result: password,
        });
        break;
    }
  } catch (err) {
    console.error("generator-worker:", err);
    postMessage({
      id: msg.id,
      error: `${err}`,
    });
  }
};
