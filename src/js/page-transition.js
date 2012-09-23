
function makeChart(labels, data) {
    $('#chart').empty();

    var design = {
            label: {
                font: 'bold 11px Helvetica, Arial',
                fill: '#777'
            }
            , date: {
                font: 'bold 12px Helvetica, Arial',
                fill: '#fff'
            }
            , data: {
                font: 'bold 13px Helvetica, Arial',
                fill: '#fff'
            }
        },
        gutter = { top: 20, bottom: 20, left: 0 },
        MAX = Math.max.apply(Math, data),
        W = 600,
        H = 300,
        R = Raphael('chart', W, H),
        C = '#8c0',
        X = (W - gutter.left) / labels.length,
        Y = (H - gutter.bottom - gutter.top) / MAX;

    $('#actual-max').text(setComma(MAX));

    R.drawGrid(
        gutter.left + X * 0.5 + 0.5,
        gutter.top + 0.5,
        W - gutter.left - X,
        H - gutter.top - gutter.bottom,
        10, 10, '#333'
    );

    var path = R.path().attr({stroke: C, 'stroke-width': 4, 'stroke-linejoin': 'round'}),
        bgp = R.path().attr({stroke: 'none', opacity: 0.3, fill: C}),
        label = R.set(),
        is_label_visible = false,
        leave_timer,
        blanket = R.set();

    label.push(R.text(60, 12, '100,000 kW').attr(design.data));
    label.push(R.text(60, 27, '2011/3/11 15h').attr(design.date).attr({fill: C}));
    label.hide();

    var frame = R.popup(100, 100, label, 'right')
                 .attr({
		     fill: '#000',
		     stroke: '#666',
		     'stroke-width': 2,
		     'fill-opacity': 0.7
		 }).hide();

    var p, bgpp;
    for (var i = 0, len = labels.length; i < len; i++) {
        var time = new Date(labels[i]),
            y = Math.round(H - gutter.bottom - Y * (data[i])),
            x = Math.round(gutter.left + X * (i + 0.5)),
            t = R.text(x, H - 6, time.getHours()).attr(design.label).toBack();
        if (!i) {
            p = ['M', x, y, 'C', x, y];
            bgpp = ['M', gutter.left + X * 0.5, H - gutter.bottom, 'L', x, y, 'C', x, y];
        }
        if (i && i < len - 1) {
            var Y0 = Math.round(H - gutter.bottom - Y * data[i - 1]),
                X0 = Math.round(gutter.left + X * (i - 0.5)),
                Y2 = Math.round(H - gutter.bottom - Y * data[i + 1]),
                X2 = Math.round(gutter.left + X * (i + 1.5));
            var a = getAnchors(X0, Y0, x, y, X2, Y2);
            p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
            bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
        }
        var dot = R.circle(x, y, 4).attr({fill: '#111', stroke: C, 'stroke-width': 2});
        blanket.push(R.rect(gutter.left + X * i, 0, X, H - gutter.bottom).attr({stroke: 'none', fill: '#fff', opacity: 0}));
        var rect = blanket[blanket.length - 1];

        (function(x, y, d, t, dot) {
            var timer, i = 0;
            rect.hover(function() {
                clearTimeout(leave_timer);
                var side = (x + frame.getBBox().width > W) ? 'left' : 'right';
                var ppp = R.popup(x, y, label, side, 1);
                frame.show().stop().animate({path: ppp.path}, 200 * is_label_visible);
                label[0].attr({text: setComma(d) + ' kW'}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, 200 * is_label_visible);
                label[1].attr({text: getYmdH(t)}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, 200 * is_label_visible);
                dot.attr('r', 6);
                is_label_visible = true;
            }, function() {
                dot.attr('r', 4);
                leave_timer = setTimeout(function () {
                    frame.hide();
                    label[0].hide();
                    label[1].hide();
                    is_label_visible = false;
                }, 1);
            });
        })(x, y, data[i], time, dot);
    }
    p = p.concat([x, y, x, y]);
    bgpp = bgpp.concat([x, y, x, y, 'L', x, H - gutter.bottom, 'z']);
    path.attr({path: p});
    bgp.attr({path: bgpp});
    frame.toFront();
    label[0].toFront();
    label[1].toFront();
    blanket.toFront();
}

var regions = {
    tokyo:  { name: '東京電力', min: '2007-01-01' },
    tohoku: { name: '東北電力', min: '2008-04-01' },
    kansai: { name: '関西電力', min: '2011-08-03' },
    kyushu: { name: '九州電力', min: false },
    chubu:  { name: '中部電力', min: '2011-08-08' }
};

function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
    var l1 = (p2x - p1x) / 2,
        l2 = (p3x - p2x) / 2,
        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
    a = p1y < p2y ? Math.PI - a : a;
    b = p3y < p2y ? Math.PI - b : b;
    var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
        dx1 = l1 * Math.sin(alpha + a),
        dy1 = l1 * Math.cos(alpha + a),
        dx2 = l2 * Math.sin(alpha + b),
        dy2 = l2 * Math.cos(alpha + b);
    return {
        x1: p2x - dx1,
        y1: p2y + dy1,
        x2: p2x + dx2,
        y2: p2y + dy2
    };
}

function getYmd() {
    var t = new Date(), month = t.getMonth() + 1;
    return t.getFullYear() + '-'
        + (month < 10 ? '0' + month : month) + '-'
        + (t.getDate() < 10 ? '0'+ t.getDate() : t.getDate());
}

function getYmdH(t) {
    return t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + 'h';
}

function setComma(n) {
    var r = new String(n).replace(/,/g, '');
    while (r != (r = r.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
    return r;
}

function changeRegion() {
    $('#date').attr('min', regions[$('#region').val()].min).attr('max', getYmd());
}

function loadUsage() {
    $('#nowloading').show();
    $('#chart').hide();
    $('#date').val() || $('#date').val(getYmd());
    $.ajax({
        url: 'http://api.gosetsuden.jp/usage/' + $('#region').val() + '/actual',
        type: 'get',
        data: { date: $('#date').val() },
        dataType: 'json',
        success: function(json) {
            var labels = [], data = [];
            for (var row in json) {
                labels.push(json[row].timestamp);
                data.push(json[row].usage);
            }
            makeChart(labels, data);
            $('#nowloading').hide();
            $('#chart').show();
        }
    });
    $.ajax({
        url: 'http://api.gosetsuden.jp/peak/' + $('#region').val() + '/demand',
        type: 'get',
        data: { date: $('#date').val() },
        dataType: 'json',
        success: function(json) {
            $('#peak-demand').text(setComma(json[0].usage));
        }
    });
    $.ajax({
        url: 'http://api.gosetsuden.jp/peak/' + $('#region').val() + '/supply',
        type: 'get',
        data: { date: $('#date').val() },
        dataType: 'json',
        success: function(json) {
            $('#peak-supply').text(setComma(json[0].usage));
        }
    });
}

$('#region').change(changeRegion);
$('#load').click(loadUsage);
changeRegion();
loadUsage();

