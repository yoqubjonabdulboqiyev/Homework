const Product = require("./models/Product");
const History = require("./models/history")
const fs = require("fs");
const Price = require("./models/price");

const action = process.argv[2];

const bootstrap = async () => {
  if (action === "buy") {
    const name = process.argv[3];
    const count = Number(process.argv[4]);
    const buyPrice = Number(process.argv[5]);
    const sellPrice = Number(process.argv[6]);
    const products = JSON.parse(
      await fs.promises.readFile("./database/products.json")
    );

    const stories = JSON.parse(
      await fs.promises.readFile("./database/stories.json")
    );

    const findProduct = products.find((product) => product.name === name);

    if (!findProduct) {
      const id = products.length + 1;

      const newProduct = new Product(id, name, +count, buyPrice, sellPrice);

      const data = products.length ? [...products, newProduct] : [newProduct];

      await fs.promises.writeFile(
        "./database/products.json",
        JSON.stringify(data, null, 2)
      );
    } else {
      findProduct.count += +count;
      findProduct.sellPrice = sellPrice;
      findProduct.buyPrice = buyPrice;
      await fs.promises.writeFile(
        "./database/products.json",
        JSON.stringify(products, null, 2)
      );
    }
    const newHistory = new History(name, count, buyPrice, sellPrice, "buy", new Date())
    // const newHistory = `Vaqt: ${new Date()} Sotib olindi. Meva: ${name}; Soni: ${count}`;

    const history = stories.length ? [...stories, newHistory] : [newHistory];

    await fs.promises.writeFile(
      "./database/stories.json",
      JSON.stringify(history, null, 2)
    );
  } else if (action === "sell") {
    const name = process.argv[3];
    const count = Number(process.argv[4]);
    const buyPrice = Number(process.argv[5]);
    const sellPrice = Number(process.argv[6]);
    const products = JSON.parse(
      await fs.promises.readFile("./database/products.json")
    );

    const findProduct = products.find((product) => product.name === name);
    if (!findProduct || findProduct.count < count) {
      console.log("Bunday mahsulot mavjud emas");
      return;
    }

    findProduct.count -= count;

    await fs.promises.writeFile(
      "./database/products.json",
      JSON.stringify(products, null, 2)
    );

    const stories = JSON.parse(
      await fs.promises.readFile("./database/stories.json")
    );

    const newHistory = new History(name, count, buyPrice, sellPrice, "sell", new Date())
    const history = stories.length ? [...stories, newHistory] : [newHistory];

    await fs.promises.writeFile(
      "./database/stories.json",
      JSON.stringify(history, null, 2)
    );

    const prices = JSON.parse(
      await fs.promises.readFile("./database/price.json")
    )

    const findPrice = prices.find((prices) => prices.name === name);

    if (!findPrice) {
      const newPrice = new Price(name, count * (sellPrice - buyPrice))
      const price = prices.length ? [...prices, newPrice] : [newPrice];
      await fs.promises.writeFile(
        "./database/price.json",
        JSON.stringify(price, null, 2)
      );

    }
    else if (findPrice) {
      findPrice.benefit += (count * (sellPrice - buyPrice));
      await fs.promises.writeFile(
        "./database/price.json",
        JSON.stringify(prices, null, 2)
      );
    }
    // const newPrice = new Price(name, (sellPrice - buyPrice))
  } else if (action === "shows") {
    const products = JSON.parse(
      await fs.promises.readFile("./database/products.json")
    );

    console.table(products);
  } else if (action === "search") {
    const products = JSON.parse(
      await fs.promises.readFile("./database/products.json")
    );

    const search = process.argv[3];

    const filtered = products.filter((product) => {
      const name = product.name.toLowerCase();
      return name.includes(search.toLowerCase());
    });

    console.table(filtered);
  }
  else if (action === "prices") {
    const prices = JSON.parse(
      await fs.promises.readFile("./database/price.json")
    );

    console.table(prices);
  }
  else if (action === "price") {
    const prices = JSON.parse(
      await fs.promises.readFile("./database/price.json")
    );
    let price = 0
    for (let item of prices) {
      price += item.benefit
    }

    console.log(`Sizda ${price} foyda bor`);
  }
};

bootstrap();
