"use strict";

var BlCharts = {};

BlCharts.chartTransactions  = null;
BlCharts.chartBlockRate     = null;


BlCharts.init = (function() {

    var options = {
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    };

    var data1 = {
        labels: [],
        datasets: [
            {
                label: "transactions",
                fill: 'bottom',
                //lineTension: 0.0,
                //tension: 0,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255,99,132,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
                stepped: true
            }
        ]
    };

    var data2 = {
        labels: [],
        datasets: [
            {
                label: "block time",
                fill: 'bottom',
                //lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
                stepped: true,
            }
        ]
    };

    var data3 = {
        labels: [],
        datasets: [
            {
                label: "duration",
                fill: "bottom",
                //lineTension: 0.1,
                stepped: true,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

    var data4 = {
        labels: [],
        datasets: [
            {
                label: "block size",
                fill: "bottom",
                //lineTension: 0.1,
                stepped: true,
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

    var data5 = {
        labels: [],
        datasets: [
            {
                label: "transactions",
                fill: "bottom",
                //lineTension: 0.1,
                stepped: true,
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
    };

    var data6 = {
        labels: [],
        datasets: [
            {
                label: "gas limit",
                fill: 'bottom',
                lineTension: 0.0,
                tension: 0,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255,99,132,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
                stepped: true
            }
        ]
    };



    var ctxTransactions   = $("#chartTransactions");
    var ctxBlockRate      = $("#chartBlockRate");
/*
    var ctxDifficult = $("#chartDifficult");
    var ctxDuration  = $("#chartDuration");
    var ctxSize      = $("#chartSize");
    var ctxTxs       = $("#chartTxs");
    var ctxGasLimit  = $("#chartGasLimit");
*/
    BlCharts.chartTransactions   = new Chart (ctxTransactions,   {type:'line', data: data1, options:options});
    BlCharts.chartBlockRate      = new Chart (ctxBlockRate,      {type:'line', data: data2, options:options});
/*
    BlCharts.chartDuration  = new Chart (ctxDuration,  {type:'line', data: data3, options:options});
    BlCharts.chartSize      = new Chart (ctxSize,      {type:'line', data: data4, options:options});
    BlCharts.chartTxs       = new Chart (ctxTxs,       {type:'line', data: data5, options:options});
    BlCharts.chartGasLimit  = new Chart (ctxGasLimit,  {type:'line', data: data6, options:options});
*/
    //ctxGasUsed[0].width = $("#chartGasUsedDiv").width

})

BlCharts.update = (function(data, totalBlocks) {
    var labelsTransactions = [];
    var dataTransactions = []

    //count transactions per block
    for (var i=0; i< data.length ; i++) {
        var timestamp = new Date(data[data.length-i-1].timestamp*1000)
        var min = timestamp.getMinutes()
        var sec = timestamp.getSeconds()
        var x = (min>9?min:'0'+min) +':'+ (sec>9?sec:'0'+sec) 

        labelsTransactions.push (x);

        dataTransactions.push     (data[data.length-i-1].transactions);
    }
    BlCharts.chartTransactions.data.labels = labelsTransactions;
    BlCharts.chartTransactions.data.datasets[0].data = dataTransactions;
    BlCharts.chartTransactions.update(0);

    //calculate block time for this data
    var labelsBlockRate = [];
    var dataBlockRate = []
    var startTime = data[data.length-1]
    var prevTime = data[data.length-1]
    for (var i=data.length -2; i>=0; i--) {
        var timestamp = new Date(data[i].timestamp*1000)
        var min = timestamp.getMinutes()
        var sec = timestamp.getSeconds()
        var x = (min>9?min:'0'+min) +':'+ (sec>9?sec:'0'+sec) 
        labelsBlockRate.push (totalBlocks-i)

        var elapsed = data[i].timestamp - prevTime
        if (elapsed>300) {elapsed = 0}
        prevTime = data[i].timestamp

        dataBlockRate.push (elapsed);
    }
    BlCharts.chartBlockRate.data.labels = labelsBlockRate;
    BlCharts.chartBlockRate.data.datasets[0].data = dataBlockRate;
    BlCharts.chartBlockRate.update(0);
})

BlCharts.updateBlocks = (function(blocks) {

    var labelsGasUsed = [];
    var dataTxs = [];
    var dataTimestamp = [];
    var dataSize   = [];
    var dataDifficulty = [];
    var dataGasUsed = [];
    var dataGasLimit = [];

    var sumTimestamp = 0;
    var sumTxs       = 0;
    var nTimestamp   = 0;
    var minTimestamp = -1;
    var maxTimestamp = -1;
    var minTimestampTen = -1;
    var maxTimestampTen = -1;

    var sumTimestampTen = 0;

    for (var i=0; i< blocks.length ; i++) {
        labelsGasUsed.push (blocks[i].blockNumber);

        dataGasUsed.push     (blocks[i].gasUsed);
        /*
        dataGasLimit.push    (blocks[i].gasLimit);
        dataDifficulty.push  (blocks[i].difficulty);
        dataSize.push        (blocks[i].size);
        if (i>0) {
            dataTimestamp.push(blocks[i].timestamp - blocks[i-1].timestamp);
            sumTimestamp+= blocks[i].timestamp - blocks[i-1].timestamp;
            nTimestamp ++;
            if (i>=blocks.length - 10) {
                sumTimestampTen+=blocks[i].timestamp - blocks[i-1].timestamp;
            }
        } else {
            dataTimestamp.push(0);
        }

        if (blocks[i].txs>0) {
            if (minTimestamp == -1 || minTimestamp > blocks[i].timestamp) {
                minTimestamp = blocks[i].timestamp;
            }

            if (maxTimestamp < blocks[i].timestamp) {
                maxTimestamp = blocks[i].timestamp;
            }
        }

        dataTxs.push (blocks[i].txs);
        sumTxs += blocks[i].txs;
        */
    }

    //average times between blocks
    //var averageBlockTime = Math.round(sumTimestamp/nTimestamp *10)/10;
    //var averageBlockTime10 =  Math.round(sumTimestampTen/10*10)/10

    //speed, how many tx, per minute? take only time when tx were processed
    //var txpermin = 0;
    //if (minTimestamp != -1) {
    //    txpermin = Math.round( sumTxs/((maxTimestamp-minTimestamp)/60) *10 )/10;
    //}

    //$("#averageBlockTime").html(averageBlockTime);
    //$("#averageBlockTime10").html(averageBlockTime10);
    //$("#txpermin").html(txpermin);

    BlCharts.chartGasUsed.data.labels = labelsGasUsed;
    BlCharts.chartGasUsed.data.datasets[0].data = dataGasUsed;
    BlCharts.chartGasUsed.update(0);



});

