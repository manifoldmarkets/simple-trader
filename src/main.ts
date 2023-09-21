import { getBets, getMarketBySlug, placeBet } from "./api";

const BET_AMOUNT = 25;
const PROB_THESHOLD = 0.02;
const REVERSION_FACTOR = 0.5;

const main = async () => {
  const username = process.env.MANIFOLD_USERNAME;
  const key = process.env.MANIFOLD_API_KEY;
  const slug = process.env.MANIFOLD_MARKET_SLUG;

  if (!username)
    throw new Error("Please set MANIFOLD_USERNAME variable in .env file.");
  if (!key)
    throw new Error("Please set MANIFOLD_API_KEY variable in .env file.");
  if (!slug) throw new Error("Please set MANIFOLD_SLUG variable in .env file.");

  console.log("Starting simple trading bot...");

  const market = await getMarketBySlug(slug);
  console.log(`Loaded market: ${market.question}\n`);

  const contractId = market.id;

  let lastBetId: string | undefined = undefined;
  let lastProbability: number | undefined = undefined;

  while (true) {
    // poll every 15 seconds
    if (lastBetId !== undefined) await sleep(15 * 1000);

    const loadedBets = await getBets({
      contractSlug: slug,
      limit: 5,
    });

    // filter out limit orders, redemptions, and antes
    const newBets = loadedBets.filter(
      (bet) => bet.amount > 0 && !bet.isRedemption && !bet.isAnte
    );

    if (newBets.length === 0) continue;

    const newestBet = newBets[0];
    if (
      newestBet.id === lastBetId ||
      newestBet.userUsername === username // exclude own bets
    )
      continue;

    console.log(
      `Loaded bet:`,
      newestBet.userUsername,
      newestBet.outcome,
      `M${newestBet.amount}`,
      `${roundProb(lastProbability ?? NaN) * 100}% => ${
        roundProb(newestBet.probAfter) * 100
      }%`,
      new Date().toLocaleTimeString()
    );

    if (lastProbability) {
      const diff = newestBet.probAfter - lastProbability;

      if (Math.abs(diff) >= PROB_THESHOLD) {
        const outcome = diff > 0 ? "NO" : "YES";
        const limitProb = roundProb(REVERSION_FACTOR * diff + lastProbability);

        const resultBet = await placeBet({
          contractId,
          amount: BET_AMOUNT,
          outcome,
          limitProb,
        });

        console.log(
          `Bet placed:`,
          resultBet.outcome,
          `M${Math.floor(resultBet.amount)}`,
          `${roundProb(newestBet.probAfter) * 100}% => ${
            roundProb(limitProb) * 100
          }%\n`
        );
      }
    }

    lastBetId = newestBet.id;
    lastProbability = newestBet.probAfter;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const roundProb = (prob: number) => Math.round(prob * 100) / 100;

if (require.main === module) {
  main();
}
