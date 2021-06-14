const puppeteer = require('puppeteer');
const Discord = require('discord.js-selfbot');
global.atob = require("atob");

const client = new Discord.Client();

//--- Channels to scan ---
channels = [795325998416658473, 795326160774234153, 795348248482807808, 611887381557280770, 816370264035950673, 813978075134033931];


url = "";


//--- Discord Client Log In ---
client.on("ready", ()=>{
  client.login($ClientToken);
  console.log("-----------------");
  console.log("Running selfbot...");
  console.log("Username: " + client.user.username);
});

client.on("message", function(message)
{
	//--- if valid channel ---
  if(channels.includes(parseInt(message.channel.id)))
  {
    console.log(message.content);
	
	//--- if message contains link ---
    if(message.embeds.length != 0)
    {
      console.log("Embed found, length: " + message.embeds.length);
	  //--- find valid link ---
      message.embeds.forEach(function(embed)
      {
        console.log("cycling embeds...");
        //console.log("Embed type: " + embed.type);
        //console.log(embed);

        embed.fields.forEach(function(field)
        {
          if(field.name == "Link")
          {
			//--- if link equals DropSentry (3rd Party Alerting System)
            url = field.value;
            if(url.includes("dropsentry"))
            {
			  //--- decode given URL ---
              query = url.substring(35, url.length);
              d = JSON.parse(unescape(atob(query)));
              newURL = d.u;
              console.log("Opening URL: " + newURL);
			  
			  //--- opening amazon url ---
              openURL(newURL);
            }
          }
		  
		  //--- additional basket link ---
		  if(field.name == "Add to Basket Link")
		  {
			  url = field.value;
			  console.log("Opening Non-Amazon url...");
			  openNonAmazon(url);
		  }
        });
      });
    }
	//--- external link ---
    else {
      openURL(message.content);
    }
  }

});


//openURL("https://www.amazon.co.uk/gp/product/B08BHYPQ8Q/");

//--- open url using Puppeteer ---
async function openURL(url)
{
  let browser;
  try{
	//--- opening browser and storing local data ---
    console.log("Opening browser...");
    browser = await puppeteer.launch({headless:false, userDataDir: './puppeteer_data'});
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation()
    await page.goto(url);
    await page.setViewport({ width: 2560, height: 1297 });

    buyNow = false;
    otherOffer = false;
    count = 0;

    console.log("Finding buy now button...");
    //await page.waitForSelector('.a-aui_72554-c > #a-page #gw-layout');

    //--- checking for buy now or offer button | reloading twice ---
    while(count != 2)
    {
      console.log("Reloading page to find buttons... on count: " + count);
      

      //--- buy button ---
      try{

        await page.waitForSelector('#buy-now-button');
        console.log("Clicking buy now button...");
        await page.click('#buy-now-button');
        console.log("Button Clicked!");
        await navigationPromise;

        console.log("Checkout complete!");
        break;

       

      } catch(err)
      {
        //--- other offers ---
        console.log("Buy-Now Button not available...");
        console.log("Looking for offers instead...");
        try{
		  await page.waitForSelector('#add-to-cart-button-ubb');
		  console.log("Adding through add-to-cart element...");
		  await page.click('#add-to-cart-button-ubb');
		  console.log("Clicked add-to-cart element!");
		  await navigationPromise;
          //login(page, navigationPromise);

        } catch(error)
        {
			try{
				await page.waitForSelector('#buybox-see-all-buying-choices');
				console.log("Clicking offer buy button...");
				await page.click('#buybox-see-all-buying-choices');
				console.log("Opened Offers!");
				await navigationPromise;
				console.log("Clicking first offer buy now...");
				const elems = await page.waitForXPath('//*[@id="a-autoid-2"]/span/input')
				await elems[0].click();
				console.log("Added to basket!");
				await navigationPromise;
			} catch(e)
			{
				//--- no buttons ---
				console.log("Offer not found either... attempting refresh");
				await page.waitForTimeout(500);
				await page.reload();
				count++;
			}
        }

      }

      /*
      else{
        console.log("Waiting 1 second...");
        await page.waitForTimeout(1000);
        page.reload();
        count++;
      }*/
    }




  } catch(err)
  {
    console.log("An error has occured...: ", err);
  }
}

//--- if login needed ---
async function login(page, navigationPromise){

  await page.waitFor('input[name=email]');

  await page.$eval('input[name=email]', el => el.value = $EMAIL)
  await page.click('input[type="submit"]');

//await navigationPromise;

  await page.waitFor('input[name=password]');
  await page.$eval('input[name=password]', el => el.value = $PASSWORD)
  await page.click('input[type="submit"]');

  await navigationPromise;
}

//--- open non amazon url ---
async function openNonAmazon(url)
{
	let browser;
	try{
		console.log("Opening browser...");
		browser = await puppeteer.launch({headless:false, userDataDir: './puppeteer_data'});
		const page = await browser.newPage();
		const navigationPromise = page.waitForNavigation()
		await page.goto(url);
		await page.setViewport({ width: 2560, height: 1297 });
		
		await page.goto(url);
		
	} catch(err)
	{
		console.log(err);
	}
}

client.login($ClientToken);
