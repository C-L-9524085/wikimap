const container = document.getElementById('map');
const input = document.getElementById('urlinput');

const links = {};
const redirects = {};

const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);

const data = {
  nodes: nodes,
  edges: edges
};
const options = {
  /*
  "edges": {
    "smooth": false
  },
  "physics": {
    "enabled": false
  }
  */
}

const network = new vis.Network(container, data, options);

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
  pageName = capitalizeFirstLetter(pageName);
  if (!links[pageName]) {
    addNode(pageName);
  }

  //processLinks(pageName);
}

async function processLinks(pageName) {
  const linksToProcess = links[pageName].splice(0, 50);

  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})

  linksToProcess.forEach(link => {
    addNode(link);
    addEdge(link, pageName);
  });
}

function addNode(nodeName) {
  try {
    //console.log("adding node", link)
    nodes.add({id: nodeName, label: nodeName});
    checkRedirectAndFetchLinksAndShowCount(nodeName);
  } catch(e) {
    console.error("couldn't add node", nodeName, e)
  }
}

function addEdge(from, to) {
  if (from != to) {
    try {
      //console.log("adding edge", from, to)
      edges.add({
        id: from + "_" + to,
        from: from,
        to: to,
        arrows: 'to'
      });
    } catch(e) {
      console.error("couldn't add edge", e)
    }
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function checkRedirectAndFetchLinksAndShowCount(pageName) {
  const data = await getLinks(pageName);
  //console.log(data);

  //console.log("redirect", pageName, data.redirects);
  if (pageName !== data.title) {
    const newPageName = data.title;
    //console.log("redirect", pageName, newPageName);
    if (nodes._data[pageName]) {
      if (links[pageName]) {
        links[newPageName] = links[pageName];
        delete links[pageName];
      }

      updateRedirects(pageName, newPageName);
    }

    pageName = data.title;
  }


  const redirectData = await getRedirects(pageName);
  if (redirectData && redirectData.length > 0) {
    redirectData.forEach(redirect => {
      redirects[redirect.title] = pageName;
      updateRedirects(redirect.title, pageName);
    })
  }

  if (!links[pageName]) {
    links[pageName] = data.links.map(e => e = String(e["*"])).map(e => redirects[e] || e);
  }


  //link to already-existing linked nodes
  links[pageName].forEach((link, i) => {
    if (nodes._data[link]) {
      addEdge(pageName, link);
      links[pageName].splice(i, 1);
    }
  })

  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})

  //check already-existing nodes to see if they link to our node
  Object.keys(nodes._data).forEach((nodeName) => {
    //console.log("checking if", nodeName, "has", pageName, "should link:", links[nodeName], links[nodeName] && links[nodeName].includes(pageName));
    if (links[nodeName] && links[nodeName].includes(pageName)) {
      addEdge(nodeName, pageName);

      links[nodeName].splice(links[nodeName].indexOf(pageName), 1);
      nodes.update({id: nodeName, label: nodeName + ' (' + links[nodeName].length + ')'})
    }
  })

  //todo: also search for links in common (ipod & zero-configuration networking => apple inc)
}

async function getLinks(pageName) {
  const response = await fetch("https://en.wikipedia.org/w/api.php?action=parse&redirects&prop=links&format=json&origin=*&page=" + encodeURIComponent(pageName));
  const data = await response.json();

  return data.parse;
}

async function getRedirects(pageName) {
  const response = await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=redirects&format=json&origin=*&rdlimit=max&titles=" + encodeURIComponent(pageName));
  const data = await response.json();

  //not handling rdcontinue because it's likely to fit in 500
  //console.log("redir", data);
  for (let pageId in data.query.pages) {
    const page = data.query.pages[pageId];
    if (page.title === pageName) {
      return page.redirects;
    }
  }
}

function updateRedirects(oldName, newName) {
  //console.log("updateRedirects", oldName, newName)
  //update node with oldName
  if (nodes._data[oldName]) {
    if (links[newName]) {
      links[oldName] = links[newName];
      delete links[oldName];
    }

    nodes.remove({id: oldName});
  }

  //update edges to old name
  Object.keys(edges._data).forEach(edge => {
    edge = edges._data[edge];
    if (edge.to === oldName) {
      edges.add({
        id: edge.from + '_' + newName,
        from: edge.from,
        to: newName,
        arrows: "to"
      });

      edges.remove({id: edge.id });
    }
    else if (edge.from === oldName) {
      edges.add({
        id: newName + "_" + edge.to,
        from: newName,
        to: edge.to,
        arrows: "to"
      });

      edges.remove({id: edge.id });
    }
  })

  //update stored links
  for (let linkName in links) {
    const link = links[linkName];
    //console.log("updating links of", linkName);

    if (link.includes(oldName)) {
      //console.log("linkName had old", oldName, "replacing with", newName)
      link.splice(link.indexOf(oldName), 1, newName)
    }
  }
}

//right-click menu to show links, pick from it
