window.onload = function() {
    JapanPowerUsage.run(true);

    window.setInterval(function() {
        JapanPowerUsage.run(false);
    }, 900000);
};
