JapanPowerUsage = new function() {

    var api = 'http://api.gosetsuden.jp';
    var data = { peak: {}, instant: {} };
    var toolbar = chrome.browserAction;

    function indicate() {
        data.ratio = (data.instant.usage * 100) / data.peak.usage;
        data.result = Math.round(data.ratio);
        toolbar.setIcon({ path: 'img/meter_'+ String(Math.ceil(data.result/10)) +'.png' });
        toolbar.setBadgeText({ text: String(data.result) +'%' });
		localStorage.usageinfo = JSON.stringify(data);
    }

    function get() {
		var region = JSON.parse(localStorage.region);

        var req = new XMLHttpRequest();
        req.open('GET', api + '/peak/' + region + '/supply/today', true);
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                data.peak = JSON.parse(req.responseText)[0];

		        var req2 = new XMLHttpRequest();
		        req2.open('GET', api + '/usage/' + region + '/instant/latest', true);
		        req2.onreadystatechange = function() {
		            if (req2.readyState === 4) {
		                data.instant = JSON.parse(req2.responseText)[0];
		                indicate();
		            }
		        }
		        req2.send(null);
            }
        }
        req.send(null);
    }

    this.log = function(a) {
        console.log(a);
    };

    this.run = function(init) {
		if (init) {
	        toolbar.setBadgeBackgroundColor({ color: [66, 66, 66, 255] });
	        toolbar.setBadgeText({ text: '-- %' });
	    }
        get();
    };

    this.getData = function() {
		return data;
    };
};