const url = "https://script.google.com/macros/s/AKfycbyr8OjZVC50kpB4F871HM5aBLF6Q4wBt0Dzz_r2CCwspe9SG-zV6ZHN2H6VTg-BBS9Uiw/exec?action=checkStatus&query=8946056229";
fetch(url, { redirect: "follow" }).then(res => res.text()).then(console.log).catch(console.error);
