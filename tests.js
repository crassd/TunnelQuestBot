// const logParser = require('./logParser');



testStr = "[Mon Feb 10 00:26:16 2020] Stashboxx auctions, 'wts Spell: Allure 7k ..Spell: Paralyzing Earth1k ..Spell: Blanket of Forgetfulness1.2k...Spell: Shiftless Deeds...5k ...Spell: Tepid Deeds40p"

//items.name AS item_name, user_id, users.name AS user_name, price, server
let itemList = [{item_name: 'SHIFTLESS DEEDS', user_id: '1234', user_name: 'testuser', price: 2000, server: 'GREEN'}];

parseLog(testStr, 'GREEN');




function parseLog(text, logServer) {
    console.log(text);
    //trim timestamp
    var auction = text.toUpperCase().slice(text.indexOf(']') + 2, text.length);
    //split words into array
    var words = auction.split(' ');
    // console.log(words);
    //test if is auction
    if (words[1] === 'AUCTIONS,') {
        // client.streamAuction(text.replace('||', '|'), "GREEN");
        //trim single quotes
        words[2] = words[2].slice(1);
        words = filterWTS(words);
        auction = words.join(' ');
        if (words.length > 2) {
            itemList.forEach(({item_name, user_id, user_name, price, server}) => {
                if (server === logServer && auction.includes(item_name)) {
                        console.log('match found: ', item_name, user_id, user_name, price, server);
                        let filteredAuction = auction.slice(auction.indexOf(item_name), auction.length);
                        console.log("filtered auction = ", filteredAuction)
                        let logPrice = parsePrice(filteredAuction, item_name.length);
                        if (price === -1 && logPrice === null) {
                            console.log("match found - no price requirement", logPrice, price)
                            var seller = words[0];
                            let msg = {userId: user_id, userName: user_name, itemName: item_name, sellingPrice: logPrice, seller: seller, server: server, fullAuction: text}
                            outgoing.push(msg)
                        }
                        else if (logPrice && logPrice <= price || price === -1) {
                            console.log("Meets price criteria", logPrice, price)
                            var seller = words[0];
                            let msg = {userId: user_id, userName: user_name, itemName: item_name, sellingPrice: logPrice, seller: seller, server: server, fullAuction: text}
                            // outgoing.push(msg)
                            console.log(msg);
                        }
                    }
                }
            ) 
        }
    }
    // sendMsgs();
}

function filterWTS(wordsArray) {
    if (!wordsArray.includes('WTB')) {
        //base case, no wtb in msg
        return wordsArray
    } else {
        var auction = wordsArray;
        let trim = [];
        auction.forEach((word, index) => {
            if (word === 'WTB') {
                trim[0] = index;
                trim[1] = auction.indexOf('WTS', index);
                if (trim[1] === -1) {
                    trim[1] = auction.length;
                }
                auction.splice(trim[0], trim[1]-trim[0]);
                return;
            }
        })
        return filterWTS(auction);
    }
}

function parsePrice(text, start) {
    // console.log("price text = ", text, "start = ", start, text.substring(start))
    let price = '';
    // let xMult = false; TODO: add flag in message that multiple are available
    for (let i = start; i < text.length; i++) {
        //if text is a k preceded by number
        if (text[i] === ('K') && price.length > 0){
            console.log("parsePrice price = ", Number(price) * 1000)
            return Number(price) * 1000;
        
            //if text is a x preceded by a number(s)
        }    else if (text[i].match(/[xX]/) && price.length > 0) {
            price = '';
            //if text is x followed by a number
        }   else if (text[i].match(/[xX]/) && text[i+1] !== undefined && text[i+1].match(/[0-9]/)) {
            price = '';
            let k = i+2
            while (text[k].match(/[0-9.]/)) {
                k++;
            }
            i = k;
        }
            //if text is a letter, the next item is being listed- return price
            else if (text[i].match(/[A-Z]/)) {
            if (price.length === 0) {
                console.log("parsePrice price = ", price)
                return null;
            } else {
                console.log("parsePrice price = ", price)
                return Number(price);
            }
            //otherwise if text is a number, add it to price string
        } else if (text[i].match(/[0-9.]/)) {
            price += text[i];
        }
    }
    console.log("parsePrice price = ", price)
    return Number(price);
}