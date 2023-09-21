# simple-trader
Simple prototype trading bot using Manifold API.

The strategy implemented here polls a market for updates and then bets the price will revert. 

# Run this bot!

1. Clone the repository
2. Locate your Manifold API Key. You can find it in Your profile => Edit => Api key.
3. Create a `.env` file in the root directory with your api key, replacing the `xxx`'s, and your username.

   ```
   MANIFOLD_API_KEY=xxxxxxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   MANIFOLD_USERNAME=YourUsername
   MANIFOLD_MARKET_SLUG=slug-for-market
   ```

4. Install npm packages with `yarn`
5. Run `yarn start`

(Be careful! This bot will be placing trades with your mana.)

Feel free to fork and extend this bot with more advanced strategies!