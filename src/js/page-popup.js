
function DOMId(id) {
    return document.getElementById(id);
}

function togglePage(page) {
    switch (page) {
        case 'info':
            region = JSON.parse(localStorage.region);
            update();
            DOMId('epco-name').innerHTML = chrome.i18n.getMessage(region);
            DOMId('info').style.display = 'block';
            DOMId('setting').style.display = 'none';
            DOMId('btn-info').disabled = true;
            DOMId('btn-setting').disabled = false;
            break;
        case 'setting':
            region = JSON.parse(localStorage.region);
            for (var i = 0; i < DOMId('epco').options.length; i++) {
                if (DOMId('epco').options[i].value === region) {
                    DOMId('epco').options[i].selected = true;
                    break;
                }
            }
            DOMId('info').style.display = 'none';
            DOMId('setting').style.display = 'block';
            DOMId('btn-info').disabled = false;
            DOMId('btn-setting').disabled = true;
            break;
    }
}

function update() {
    var usageinfo = JSON.parse(localStorage.usageinfo);

    DOMId('graph-hide').style.width = (100 - parseInt(usageinfo.result)) + '%';
    DOMId('data-usage').innerHTML = usageinfo.instant.usage.toString().replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g, '$1,');
    DOMId('data-capacity').innerHTML = usageinfo.peak.usage.toString().replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g, '$1,');
    DOMId('data-userate').innerHTML = usageinfo.result;

    var lastupdated = new Date(new Date(usageinfo.instant.timestamp).getTime());
    var t = {Y:lastupdated.getFullYear(), m:lastupdated.getMonth() + 1, d:lastupdated.getDate(), H:lastupdated.getHours()};
    var tmp = chrome.i18n.getMessage('usage_updated_format').replace('Y', t.Y).replace('m', t.m).replace('d', t.d).replace('H', t.H);
    DOMId('data-usage_updated').innerHTML = tmp;

    DOMId('link1').setAttribute('href', chrome.i18n.getMessage(region + '_url'));
    DOMId('link2').setAttribute('href', 'http://setsuden.yahoo.co.jp/' + region + '/');
    DOMId('link').style.display = 'block';
}

DOMId('save').onclick = function() {
    if (!DOMId('epco').value) {
        DOMId('error').innerHTML = 'Please select!';
        return false;
    }
    DOMId('error').innerHTML = '';
    localStorage.region = JSON.stringify(DOMId('epco').value);
    JapanPowerUsage.run(true);
};

DOMId('btn-info').onclick = function() {
    togglePage('info');
};

DOMId('btn-setting').onclick = function() {
    togglePage('setting');
};

//DOMId('btn-transition').onclick = function() {
//    window.open('transition.html');
//};

i18n();

if (localStorage.region) {
    var region = JSON.parse(localStorage.region);
    togglePage('info');
} else {
    var region = 'tokyo';
    localStorage.region = JSON.stringify(region);
    togglePage('setting');
    JapanPowerUsage.run(true);
}

if (localStorage.usageinfo) {
    update();
}

