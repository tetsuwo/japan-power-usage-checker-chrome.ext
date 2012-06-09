TEPCOPowerUsage = new function()
{
    var API_URL = 'http://tepco-usage-api.appspot.com/latest.json',
        data = {},
        toolbar = chrome.browserAction;

    function indicate()
    {
        data.ratio = (data.usage * 100) / data.capacity;
        data.result = Math.round(data.ratio);
        toolbar.setIcon({path:'img/meter_' + String(Math.ceil(data.result/10)) + '.png'});
        toolbar.setBadgeText({text:String(data.result)+'%'});
		localStorage.usageinfo = JSON.stringify(data);
    }

    function get()
    {
        var req = new XMLHttpRequest();
        req.open('GET', API_URL, true);
        req.onreadystatechange = function()
        {
            if (req.readyState === 4)
            {
                data = JSON.parse(req.responseText);
                indicate();
            }
        }
        req.send(null);
    }

    this.log = function(a)
    {
        console.log(a);
    };

    this.run = function(init)
    {
		if (init)
		{
	        toolbar.setBadgeBackgroundColor({color:[66, 66, 66, 255]});
	        toolbar.setBadgeText({text:'-- %'});
	    }
        get();
    };

    this.getData = function()
    {
		return data;
    };
};