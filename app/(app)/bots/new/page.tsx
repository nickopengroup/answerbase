import { BotWizard } from "./bot-wizard";

export default function NewBotPage() {
  return (
    <BotWizard
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
    />
  );
}
