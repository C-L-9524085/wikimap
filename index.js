  // create an array with nodes
  var nodes = new vis.DataSet([]);

  // create an array with edges
  var edges = new vis.DataSet([]);

  // create a network
  var container = document.getElementById('map');
  var input = document.getElementById('urlinput');
  var data = {
    nodes: nodes,
    edges: edges
  };
var options = {
  /*
  "edges": {
    "smooth": false
  },
  "physics": {
    "enabled": false
  }
  */
}

var network = new vis.Network(container, data, options);

network.on("doubleClick", (e) => {
  console.log("doubleClick", e)
});

network.on("click", (e) => {
  console.log("click", e)
});
network.on("selectNode", (e) => {
  console.log("selectNode", e)
});

network.on("oncontext", (e) => {
  console.log("oncontext", e)
  e.event.preventDefault();
  parsePage(e.nodes[0])
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    parsePage(e.target.value);
    e.target.value = "";
  }
})

async function parsePage(pageName) {
  if (!links[pageName]) {
    nodes.add({id: pageName, label: pageName});

    const data = await getLinks(pageName);
    if (data.redirects && data.redirects[0] && data.redirects[0].from === pageName) {
      const newPageName = String(data.redirects[0].from);
      if (nodes._data[pageName]) {
        //todo update node & remove one if needed & update edges
      }

      pageName = newPageName;
    }

    links[pageName] = data.links;
  }

  processLinks(pageName);
}

async function processLinks(pageName) {
  console.log("processLinks", pageName, links[pageName].length)
  linksToProcess = links[pageName].splice(0, 50);
  console.log("processLinks", pageName, links[pageName].length)

  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})

  linksToProcess.forEach(link => {
    link = String(link["*"]);

    if (!link.startsWith('Wikipedia:') && !link.startsWith('Talk:') && link != pageName) {
      try {
        //console.log("adding node", link)
        nodes.add({id: link, label: link});
        checkRedirectAndFetchLinksAndShowCount(link);
      } catch(e) {
        console.error("couldn't add node", link, e)
      }
      try {
        //console.log("adding edge", pageName, link)
        edges.add({
          id: pageName + "_" + link,
          from: pageName,
          to: link
        });
      } catch(e) {
        console.error("couldn't add edge", e)
      }
    }
  });
}

async function checkRedirectAndFetchLinksAndShowCount(pageName) {
  const data = await getLinks(pageName);

  if (data.redirects && data.redirects.length && pageName === data.redirects[0].from) {
    const newPageName = data.redirects[0].from;
    if (nodes._data[pageName]) {
      //todo remove old node and reroute edges

      if (links[pageName]) {
        links[newPageName] = links[pageName];
        delete links[pageName];
      }
    }

    pageName = newPageName;
  }

  if (!links[pageName])
    links[pageName] = data.links;
  
  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})
}

async function addPage(pageName, origin) {

}

async function getLinks(pageName) {
  const response = await fetch("https://en.wikipedia.org/w/api.php?action=parse&redirects&prop=links&format=json&origin=*&page=" + encodeURIComponent(pageName));
  const data = await response.json();
  //const parsed = parseWikiApiData(data);
  //console.log("getLinks", data);

  return data.parse;
}


const links = {};