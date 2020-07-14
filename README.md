# Introduction
[Textograph](https://github.com/textograph/textograph) is a web-base application for creating tree-view diagrams from text (by human, not automatic). when you created diagrams; memorizing it is quite combersome. this anki add-on lets you to easily review the diagrams created by texttograph.


![textograph anki](src/image.png?raw=true)


# Dependencies
* The code for creating graphs came from awesome [D3js](https://github.com/d3/d3) library and [radial tree](https://observablehq.com/@d3/radial-tidy-tree) and [collapsible tree](https://observablehq.com/@d3/collapsible-tree) implementations.
* [Anki](https://apps.ankiweb.net/) program, a wonderfull spaced repetition based flashcard program. this add-on tested on Anki 2.1.26  on both windows and linux based systems

# How to use
1. Install this add-on from anki add-on page
2. Install ankiConnect add-on from here
3. Change ankiConnect Config (from add-on dialog) as presented below:
```
{
    "apiKey": null,
    "apiLogPath": null,
    "webBindAddress": "0.0.0.0",
    "webBindPort": 8765,
    "webCorsOrigin": "http://localhost",
    "webCorsOriginList": [
        "http://localhost",
        "*"
    ]
}
```
`,"*"` is the only thing that we have to  add to webCorsOriginList

2. Create your graph with Textograph. an example page is uploaded [here](http://test.textograph.digitaltoxicity.ir/)(user:test, pass:test).
3. Right-Click on node that you want to export to anki
4. go to anki and review the generated card
5. If there is a problem, let me know

# Error reporting
1. you must report me: anki version, operating system, anki log 
2. if web app does not work let me know all of errors logged in log in console (in firefox you can press `ctrl`+`shift`+`i` and selecting console tab
3. internet browser and version
# Contribution
is welcomed
# Licence
Copyright Apache version 2.0
