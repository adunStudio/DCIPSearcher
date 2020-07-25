const cheerio = require('cheerio');
const request = require('request');


const URL = "https://gall.dcinside.com/mgallery/board/lists/?id=game_dev";
const SEARCH = "소년|211.168|14.33|220.127|39.7";
const TITLE = "유니티|MVC";


if(SEARCH === "")
{
    console.log("정확한 검색 문자열을 입력해주세요.");
    return;
}

let searchNameOrIPList = SEARCH.split("|");
let searchTitleList = (TITLE === "") ? [] : TITLE.split("|");

const PAGE_SEARCH_COUNT = 3;

for(var page = 1; page <= PAGE_SEARCH_COUNT; ++page)
{
    (function(p)
    {
        setTimeout(function()
        {
            Searh(URL, p);
        }, (page - 1) * 500);
    })(page);
}

function Searh(url, page)
{
    request(url + "&page=" + page, function(error, response, html)
    {
        if (error)
        {
            console.log("ERROR:");
            console.log(error);
            return;
        }

        let $ = cheerio.load(html);

        if(page === 1)
        {
            let galleryName = $(".page_head").find("div").eq(0).text().trim();
            console.log("========================================================================================");
            console.log("(" + SEARCH + ") " + galleryName + " 검색 결과:");
            console.log("========================================================================================");
        }

        let str = "";
        let writeCount = 0;
        $(".gall_list").find(".ub-content").each(function()
        {
            let data = $(this);

            let ip = String(data.find(".gall_writer").data("ip")).trim();
            let nickname = String(data.find(".gall_writer").data("nick")).trim();//.toString().trim();

            let match = false;
            var count = 0;
            for(let i = 0; i < searchNameOrIPList.length; ++i)
            {
                if(searchNameOrIPList[i] === "") continue;
                if(nickname === searchNameOrIPList[i]) { match = true; count++; }
                if(ip       === searchNameOrIPList[i]) { match = true; count++; }
                //if(match == true) break;
            }

            let titleData =  data.find(".gall_tit").find("a");
            let title = titleData.eq(0).text().trim();
            let commentCount = titleData.eq(1).text();
            let href = "https://gall.dcinside.com/" + titleData.eq(0).attr("href");
            let date = data.find(".gall_date").attr("title");

            let findTitle = false;
            if(searchTitleList.length > 0)
            {
                for(let i = 0; i < searchTitleList.length; ++i)
                {
                    if(searchTitleList[i] === "") continue;
                    if(title.indexOf(searchTitleList[i]) !== -1)
                    {
                        findTitle = true;
                        break;
                    }
                }
            }

            if((!match || count < 2) && !findTitle) return;

            writeCount++;

            //console.log("[" + nickname + "](" + ip + ") " + title + " " + commentCount);
            str += "[" + nickname + "](" + ip + ") " + title + " " + commentCount + " " + href + " <" + date +">" + "\n";
        });

        if(writeCount > 0)
        {
            if(page === 1)
            {
                console.log(page + " 페이지: " + writeCount +"개의 글");
                console.log("========================================================================================");
            }
            else
            {
                console.log("========================================================================================");
                console.log(page + " 페이지:" + writeCount +"개의 글");
            }

            str = str.slice(0, -1);
            console.log(str);
        }
    });
}
