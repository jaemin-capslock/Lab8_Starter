describe("Basic user flow for Website", () => {
  // First, visit the lab 8 website
  beforeAll(async () => {
    await page.goto("https://cse110-f2021.github.io/Lab8_Website");
  });

  // Next, check to make sure that all 20 <product-item> elements have loaded
  it("Initial Home Page - Check for 20 product items", async () => {
    console.log("Checking for 20 product items...");
    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval("product-item", (prodItems) => {
      return prodItems.length;
    });
    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  it("Make sure <product-item> elements are populated", async () => {
    console.log(
      "Checking to make sure <product-item> elements are populated..."
    );
    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;
    let data, plainValue;
    // Query select all of the <product-item> elements
    console.log(
      "Checking to make sure <product-item> elements are populated..."
    );
    const prodItems = await page.$$("product-item");
    for (let i = 0; i< prodItems.length; i++){
      console.log(`Checking product item ${i}/${prodItems.length}`);
      // Grab the .data property of <product-items> to grab all of the json data stored inside
      data = await prodItems[i].getProperty('data');
      // Convert that property to JSON
      plainValue = await data.jsonValue();
      // Make sure the title, price, and image are populated in the JSON
      if (plainValue.title.length == 0) { allArePopulated = false; }
      if (plainValue.price.length == 0) { allArePopulated = false; }
      if (plainValue.image.length == 0) { allArePopulated = false; }
      // Expect allArePopulated to still be true
    }
    expect(allArePopulated).toBe(true);

    // TODO - Step 1
    // Right now this function is only checking the first <product-item> it found, make it so that
    // it checks every <product-item> it found
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');
    const firstProductItem = await page.$("product-item");
    // use shadow root
    const shadowRoot = await page.evaluateHandle(
      (el) => el.shadowRoot,
      firstProductItem
    );
    const button = await shadowRoot.$("button");
    await button.click();
    const innerTextProperty = await button.getProperty("innerText");
    const innerTextValue = await innerTextProperty.jsonValue();
    expect(innerTextValue).toBe("Remove from Cart");
    // TODO - Step 2
    // Query a <product-item> element using puppeteer ( checkout page.$() and page.$$() in the docs )
    // Grab the shadowRoot of that element (it's a property), then query a button from that shadowRoot.
    // Once you have the button, you can click it and check the innerText property of the button.
    // Once you have the innerText property, use innerText.jsonValue() to get the text value of it
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it("Checking number of items in cart on screen", async () => {
    console.log("Checking number of items in cart on screen...");
    const productItems = await page.$$("product-item");
    for (let i = 1; i < productItems.length; i++) {
      // start from 1 because we've already clicked the first one
      const shadowRoot = await page.evaluateHandle(
        (el) => el.shadowRoot,
        productItems[i]
      );
      const button = await shadowRoot.$("button");
      await button.click();
    }
    const cartCountText = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCountText).toBe("20");
    // TODO - Step 3
    // Query select all of the <product-item> elements, then for every single product element
    // get the shadowRoot and query select the button inside, and click on it.
    // Check to see if the innerText of #cart-count is 20
  }, 10000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it("Checking number of items in cart on screen after reload", async () => {
    console.log("Checking number of items in cart on screen after reload...");
    await page.reload();
    const productItems = await page.$$("product-item");
    for (let i = 0; i < productItems.length; i++) {
      const shadowRoot = await page.evaluateHandle(
        (el) => el.shadowRoot,
        productItems[i]
      );
      const button = await shadowRoot.$("button");
      const innerTextProperty = await button.getProperty("innerText");
      const innerTextValue = await innerTextProperty.jsonValue();
      expect(innerTextValue).toBe("Remove from Cart");
    }
    const cartCountText = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCountText).toBe("20");
    // TODO - Step 4
    // Reload the page, then select all of the <product-item> elements, and check every
    // element to make sure that all of their buttons say "Remove from Cart".
    // Also check to make sure that #cart-count is still 20
  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it("Checking the localStorage to make sure cart is correct", async () => {
    // TODO - Step 5
    const localStorageContent = await page.evaluate(() =>
      localStorage.getItem("cart")
    );
    expect(localStorageContent).toBe(
      "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
    );
    // At this point he item 'cart' in localStorage should be
    // '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it("Checking number of items in cart on screen after removing from cart", async () => {
    const prodItems = await page.$$("product-item");

    for (let product of prodItems) {
      // Waiting for the button in each product-item to load
      const shadowRoot = await page.evaluateHandle(
        (el) => el.shadowRoot,
        product
      );
      const button = await shadowRoot.$("button");

      // Checking the text on the button
      const buttonText = await page.evaluate(el => el.innerText, button);

      // If the button says "Remove from Cart", click it
      if (buttonText === "Remove from Cart") {
        await button.click();
      }
    }

    // Waiting for the #cart-count element to load
    await page.waitForSelector("#cart-count");

    // Checking to make sure that #cart-count is now 0
    const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCount).toBe("0");
    // TODO - Step 6
    // Go through and click "Remove from Cart" on every single <product-item>, just like above.
    // Once you have, check to make sure that #cart-count is now 0
  }, 10000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it("Checking number of items in cart on screen after reload", async () => {
    console.log("Checking number of items in cart on screen after reload...");
    await page.reload();

  // Grabbing all product items
  const prodItems = await page.$$("product-item");

  for (let product of prodItems) {
    // Waiting for the button in each product-item to load

    // Checking the text on the buttons
    const productShadow = await product.getProperty('shadowRoot')
    const elementButton = await productShadow.$('button')
    const text = await elementButton.getProperty('innerText')
    const buttonText = await text.jsonValue();

    // The button text should be "Add to Cart"
    expect(buttonText).toBe("Add to Cart");
  }

  // Checking to make sure that #cart-count is still 0
  const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
  expect(cartCount).toBe("0");
    // TODO - Step 7
    // Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
    // is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
    // Also check to make sure that #cart-count is still 0
  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it("Checking the localStorage to make sure cart is correct", async () => {
    console.log("Checking the localStorage...");
    const localStorageCart = await page.evaluate(() => {
      return localStorage.getItem("cart")
  });
    expect(localStorageCart).toBe("[]");
    // TODO - Step 8
    // At this point he item 'cart' in localStorage should be '[]', check to make sure it is
  });
});
