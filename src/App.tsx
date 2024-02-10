import { useEffect, useState } from "react";
import { MultiSelect, iOption } from "./components/MultiSelect/MultiSelect";
import { geckoApi } from "./api/gecko";

interface iCoin {
  name: string;
  symbol: string;
  id: string;
};

const random = () => Math.floor(Math.random() * 3000);
const isArray = (ds: any) => Array.isArray(ds) && !!ds.length;
const parsedCoinList = (ds: iCoin[] | null) => ds ? ds.map(({ id, symbol, ...rest }) => ({ ...rest, label: id, value: symbol })) : [];
const partialList = (list: iCoin[] | null) => list ? list.slice(0, random()) : [];

async function getCoinsList(): Promise<iCoin[] | null> {
  try {
    const raw = await fetch(geckoApi.list());
    const parsed = await raw.json();
    const partial = partialList(parsed);
    cache.set(CACHE_KEY, parsed);

    setTimeout(() => {
      cache.delete(CACHE_KEY);
    }, FIVE_MINUTES);

    return partial;
  } catch (reason) {
    if (cache.has(CACHE_KEY)) {
      return cache.get(CACHE_KEY);
    } else {
      console.log("Error while uploading coins list", reason);
      return null;
    }
  }
}

const cache = new Map();
const CACHE_KEY = "coins";
const FIVE_MINUTES = 1000 * 5 * 60;

export const App = () => {
  const [coins, setCoins] = useState<iCoin[] | null>(null);

  useEffect(() => {
    const cached = cache.has(CACHE_KEY);

    (async () => {
      const list = cached ? cache.get(CACHE_KEY) : await getCoinsList();
      setCoins(partialList(list));
    })();
  }, []);

  const onValue = (picked: iOption[], restList: iOption[]) => {
    console.dir({ picked, restList });
  };

  if (!isArray(coins)) return null;

  return (
    <div className="App">
      <MultiSelect
        options={parsedCoinList(coins)}
        getValues={onValue}
      />
    </div>
  );
};