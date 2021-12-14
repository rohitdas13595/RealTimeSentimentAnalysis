const path=require('path');
const express=require('express');
const hbs = require('hbs');
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const WinkSentiment = require("wink-sentiment");

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;


//console.log(__dirname);
const publicDir= path.join(__dirname,'../public');
const viewsDir=path.join(__dirname,'../templates/views');
//const partialsDir=path.join(__dirname,'../templates/partials');


//Setting up the handlebars and app
const app= express()

const port=process.env.PORT || 3000
app.set('view engine','hbs');
app.set('views',viewsDir);
//hbs.registerPartials(partialsDir);

//Setting up static directory
app.use(express.static(publicDir))

// settingup mail sevices



//Data parsing
app.use(express.json());

app.use(express.urlencoded({
     extended:true
}));

app.get('',(req,res)=>{
  res.render('index',{})
})







//route for entities
app.post("/analysis/entities", async (req, res) => {
  try {
    var doc = nlp.readDoc(req.body.text);
    res.send({ entities: doc.entities().out(its.detail) });
  } catch (error) {
    res.send({ error });
  }
});

//route for other stats
app.post("/analysis/stats", async (req, res) => {
  try {
    var doc = nlp.readDoc(req.body.text);
    // Counts
    var sentences = doc.sentences().length();
    var tokens = doc.tokens().length();
    var words = doc
      .tokens()
      .filter((token) => {
        return token.out(its.type) === "word";
      })
      .length();

    // Tagged text
    var seenEntities = new Set();
    doc.tokens().each((token) => {
      var entity = token.parentEntity();
      if (entity === undefined) {
        if (token.out(its.type) === "word") {
          token.markup(
            '<span class="tag ' + token.out(its.pos) + '">',
            "</span>"
          );
        }
      } else {
        if (!seenEntities.has(entity.index())) {
          entity.markup(
            '<span class="tag ' + entity.out(its.type) + '">',
            "</span>"
          );
        }
        seenEntities.add(entity.index());
      }
    });

    // Word frequency
    var wordFreq = doc
      .tokens()
      .filter((token) => {
        return token.out(its.type) === "word" && !token.out(its.stopWordFlag);
      })
      .out(its.normal, as.freqTable);
    wordFreq = wordFreq.slice(0, 5);

    // Sentiment
    var sentiments = [];
    doc.sentences().each((s) => {
      sentiments.push({
        sentence: s.out(),
        sentiment: s.out(its.sentiment),
      });
    });
    //tagged text
    var taggedText = doc.out(its.markedUpText);
    res.send({
      sentiments,
      wordFreq,
      seenEntities,
      taggedText,
      counts: {
        sentences,
        tokens,
        words,
      },
    });
  } catch (error) {
    res.send({ error });
  }
});

//route for normalized Score.
app.post("/analysis/score", async (req, res) => {
  try {
    var result = WinkSentiment(req.body.text);
    res.send({
      normalizedScore: result.normalizedScore,
    });
  } catch (error) {
    res.send({ error });
  }
});

app.listen(port,()=>{
  console.log('Server is up running at port:', +port);
})
