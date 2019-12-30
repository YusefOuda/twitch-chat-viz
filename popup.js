var stopwords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
var height = 700;
var width = 700;
var maxWords = 500;

window.onload = function () {
    var fullmessages = [];
    var words = [];
    var users = {};

    function wordCloud(selector) {

        var fill = d3.scale.category20();

        //Construct the word cloud's SVG element
        var svg = d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(350,350)");


        //Draw the word cloud
        function draw(words) {
            var cloud = svg.selectAll("g text")
                .data(words, function (d) { return d.text; })

            //Entering words
            cloud.enter()
                .append("text")
                .style("font-family", "Impact")
                .style("fill", function (d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr('font-size', 1)
                .text(function (d) { return d.text; });

            //Entering and existing words
            cloud
                .transition()
                .duration(1000)
                .style("font-size", function (d) { return d.size + "px"; })
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("fill-opacity", 1);

            //Exiting words
            cloud.exit()
                .transition()
                .duration(500)
                .style('fill-opacity', 1e-6)
                .attr('font-size', 1)
                .remove();
        }


        //Use the module pattern to encapsulate the visualisation code. We'll
        // expose only the parts that need to be public.
        return {

            //Recompute the word cloud for a new set of words. This method will
            // asycnhronously call draw when the layout has been computed.
            //The outside world will need to call this function, so make it part
            // of the wordCloud return value.
            update: function (words) {
                d3.layout.cloud().size([width, height])
                    .words(words)
                    .padding(5)
                    .rotate(function () { return 0; })
                    .font("Impact")
                    .fontSize(function (d) { return d.size; })
                    .on("end", draw)
                    .start();
            }
        }

    }

    function getWords() {
        return words
            .map(function (d) {
                return { text: d, size: getFontSize(d) };
            });
    }

    function getFontSize(d) {
        return Math.min(15 * ( 1 + Math.sqrt(words.filter(value => value === d).length) * 2 ), 150);
    }

    function showNewWords(vis) {
        vis.update(getWords());
        var extra = maxWords - words.length;
        if (extra < 0) {
            words = words.slice(0, Math.abs(extra));
        }
        setTimeout(function () { showNewWords(vis) }, 3000);
    }

    //Create a new instance of the word cloud visualisation.
    var myWordCloud = wordCloud('#vis');
    showNewWords(myWordCloud);

    var port = chrome.runtime.connect({ name: "data" });
    port.onMessage.addListener(function (data) {
        if (data.message) {
            fullmessages.push(data.message);
            var filtered = data.message.slice(data.message.indexOf(":", 0) + 1, data.message.length).split(" ").filter(function(word) {
                return stopwords.indexOf(word) === -1 && word.replace(/[^A-Za-z0-9]/g, '').length > 1;
            }).map(function(w) {
                return w.toUpperCase();
            });
            words.push(...new Set(filtered));
            var user = data.message.slice(0, data.message.indexOf(":", 0));
            if (user && user.length && user.indexOf(":") === -1 && user.indexOf(" ") === -1) {
                if (!users[user]) {
                    users[user] = 1;
                } else {
                    users[user]++;
                }
            }
        }
        if (data.update) {
            fullmessages = [];
            words = [];
            users = {};
        }
    });
};
