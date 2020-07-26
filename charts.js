/**
 * @description encapsulate chart js objects and create functions to easies use
 * like <chart_object>.add(<data>) or .push(<data>)
 */
 const charts = {
    
    updateConf: {
        lazy: true
    },

    /**
     * @description clear the given chart to removing the data
     * @param {String} chart the chart to be clean
     */
    clear: function(chart){
        if(typeof chart == "string"){
            this.charts[chart].data.labels = [];
            this.charts[chart].data.datasets.forEach(el => el.data = []);
            this.charts[chart].update(this.updateConf);    
        }
        else if(typeof chart == "object" && chart.length > 0){
            chart.forEach(c => {
                this.clear(c)
                return true;
            })
        }
    },


    /**
     * @description [recursive] export data and labels from given chart name
     * @param {String|Array} chart chart name(s) to extract data
     * @returns {Object}
     * 1x  Object with datasets array and labels array;
     * 2x+ Array of objects with datasets ans labels;
     * 
     * **if a array with 1 (one) chart is passed, will return as array, if a string, just the object**
     * @example exportData('hist') = {datasets:[], labels:[]}
     * @example exportData(['hist']) = [{datasets:[], labels:[]}]
     * @example exportData(['hist', 'realt']) = [{datasets:[], labels:[]}, {datasets:[], labels:[]}]
     */
    exportData: function(chart){
        if(!chart) return
        
        let dat = [];

        if(typeof chart == "object"){
            if(chart.length < 0) return new Error("empty array")

            if(chart.length == 1){
                return [this.exportData(chart[0])]
            }
            else{
                chart.forEach(c => {
                    dat.push(this.exportData(c))
                })
                return dat;
            }
        }
        
        else if(typeof chart == "string"){
            if(this.charts[chart] == undefined) return new Error(`chart [${chart}] does not exist` );

            return {
                datasets: this.charts[chart].data.datasets.map(el => el.data),
                labels: this.charts[chart].data.labels
            }
        }

        else {
            return new Error("Argument must be an array of strings or a string")
        }
    },


    /**
     * **_this will fill all data arrays and labels_**
     * @description [recursive] fill array with 0's (or other data)
     * can be passed either a string or array of chart names
     * * if is a string, go straight to filling, if array and
     * * has one value, call itself with the first value
     * * and if is a array, loop trough if calling itself with chart name
     * 
     * @param {String | Array<String>} chart chart or charts to be filled
     * @param {*} value value to fill with 
     * @param {Number} max fill with 0's up to max number
     * @default max = 30
     * @default value = 0
     */
    fill: function(chart, value = 0, max = 30){
        if(!chart) return
        if(typeof chart == 'string'){
            if(this.charts[chart] == undefined) return new Error(`chart [${chart}] does not exists`)

            this.charts[chart].data.labels[max] = value;
            this.charts[chart].data.labels.fill(value, 0, max);
            
            //fill each dataset with value up to max
            this.charts[chart].data.datasets.forEach(d => {
                d.data[max] = value;
                d.data.fill(value, value, max);            
            })

            this.charts[chart].update(this.updateConf);
        }

        else if(typeof chart == "object"){
            if(chart.length <= 0) return

            if(chart.length == 1 ){
                this.fill(chart[0], value, max)
            }
            else{
                chart.forEach(c => {
                    this.fill(c, value, max)
                })
            }
        }
    },


    /**
     * @description add data to given chart name
     * 
     * @param {String} chart chart name
     * @param {Object} toAdd Object with data array,
     * label and optionally a datasetindex
     *
     * @example add('hist', {data:[0, 1], label: new Date().toLocaleTimeString()})
     * @example add('hist', {data: 2, label: 'hi', index: 1})
     */
    add: function(chart, toAdd){
        if(!chart) return
        if(typeof toAdd != "object") return new Error("data to add must be a object with data and label")

        // if the has more than one dataset
        if(typeof toAdd.data == "object"){
            toAdd.data.forEach((data, i) => {
                this.charts[chart].data.datasets[i].data.shift();
                this.charts[chart].data.datasets[i].data.push(data);
            })
        }
        else{
            this.charts[chart].data.datasets[toAdd.index || 0].data.shift();
            this.charts[chart].data.datasets[toAdd.index || 0].data.push(toAdd.data);
        }

        this.charts[chart].data.labels.shift();
        this.charts[chart].data.labels.push(toAdd.label);
        
        this.charts[chart].update(this.updateConf);
    },

    /**
     * @description push data to given chart name, same as the add, but without .shift()
     * 
     * @param {String} chart chart name
     * @param {Object} toAdd Object with data array,
     * label and optionally a datasetindex
     *
     * @example add('hist', {data:[0, 1], label: new Date().toLocaleTimeString()})
     * @example add('hist', {data: 2, label: 'hi', index: 1})
     */
    push: function(chart, toAdd){
        if(!chart) return
        if(typeof toAdd != "object") return new Error("data to add must be a object with data and label")

        // if the has more than one dataset
        if(typeof toAdd.data == "object"){
            toAdd.data.forEach((data, i) => {
                this.charts[chart].data.datasets[i].data.push(data);
            })
        }
        else{
            this.charts[chart].data.datasets[toAdd.index || 0].data.push(toAdd.data);
        }

        this.charts[chart].data.labels.push(toAdd.label);

        this.charts[chart].update(this.updateConf);
    },

    /**
     * @description charts that will be manipulated
     * 
     */
    charts:{
        // history
        hist: new Chart(document.getElementById('chart-history').getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: ['avg'],
                    data: [],
                    borderWidth: 3,
                    lineTension: 0.15,
                    backgroundColor:  'rgba(128, 118, 157, 0.2)',
                    borderColor:      'rgba(128, 118, 157, 1)',
                    pointBorderColor: 'rgba(128, 118, 157, 1)',
                },
                {
                    label: ['Min'],
                    data: [],
                    borderWidth: 3,
                    lineTension: 0.3,
                    backgroundColor:  'rgba(0, 178, 255, 0.4)',
                    borderColor:      'rgba(0, 178, 255, 1)',
                    pointBorderColor: 'rgba(0, 178, 255, 1)',
                },
                {
                    label: ['Max'],
                    data: [],
                    borderWidth: 3,
                    lineTension: 0.3,
                    backgroundColor:  'rgba(255, 58, 58, 0.1)',
                    borderColor:      'rgba(255, 58, 58, 0.7)',
                    pointBorderColor: 'rgba(255, 58, 58, 0.7)',
                }],
            },
        }),
    }

}