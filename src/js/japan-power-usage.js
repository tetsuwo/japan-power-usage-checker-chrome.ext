JapanPowerUsage = new function() {
    var toolbar = chrome.browserAction;
    var api = 'http://setsuden.yahooapis.jp';
    var data = {
        peak: {},
        instant: {},
        updated: { date: null, hour: null }
    };

    function indicate() {
        data.ratio = (data.instant.usage * 100) / data.peak.usage;
        data.result = Math.round(data.ratio);
        toolbar.setIcon({ path: 'images/meter_'+ String(Math.ceil(data.result/10)) +'.png' });
        toolbar.setBadgeText({ text: String(data.result) +'%' });
        localStorage.usageinfo = JSON.stringify(data);
    }

    function serialize(param, prefix) {
        var query = [];
        for(var p in param) {
            var k = prefix ? prefix + '[' + p + ']' : p, v = param[p];
            query.push(
                typeof v == 'object' ?
                    this.serialize(v, k) :
                    encodeURIComponent(k) + '=' + encodeURIComponent(v)
            );
        }
        return query.join('&');
    }

    function get() {
        var region = JSON.parse(localStorage.region);

        var param = {};
        param.appid = 'dj0zaiZpPW0xdDdMOFp1MDRudCZkPVlXazljMEYwV2xrNU5EZ21jR285TUEtLSZzPWNvbnN1bWVyc2VjcmV0Jng9Yjk-';
        param.area = region;
        param.output = 'json';

        var req = new XMLHttpRequest();
        req.open('GET', api + '/v1/Setsuden/latestPowerUsage?' + serialize(param), true);
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                var res = JSON.parse(req.responseText);
                if (res.ElectricPowerUsage) {
                    data.peak.usage = res.ElectricPowerUsage.Capacity.$;
                    data.instant.usage = res.ElectricPowerUsage.Usage.$;
                    data.updated.date = res.ElectricPowerUsage.Date;
                    data.updated.hour = res.ElectricPowerUsage.Hour;
                    indicate();
                }
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
