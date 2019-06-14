const container = document.getElementById('map');
const input = document.getElementById('urlinput');

const links = {};

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
  if (!links[pageName])
    await checkRedirectAndFetchLinksAndShowCount(pageName);

  //processLinks(pageName);
}

async function processLinks(pageName) {
  const linksToProcess = links[pageName].splice(0, 50);

  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})

  linksToProcess.forEach(link => {
    addNodeAndLink(link, pageName)
  });
}

function addNodeAndLink(link, pageName) {
  if (!link.startsWith('Wikipedia:') && !link.startsWith('Talk:') && !link.startsWith('File:') && link != pageName) {
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
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function checkRedirectAndFetchLinksAndShowCount(pageName) {
  const data = await getLinks(pageName);
  console.log(data);

  //console.log("redirect", pageName, data.redirects);
  if (data.redirects && data.redirects[0] && pageName.toLowerCase() === data.redirects[0].from.toLowerCase()) {
    const newPageName = data.redirects[0].to;
    //console.log("redirect", pageName, newPageName);
    if (nodes._data[pageName]) {
      //todo remove old node and reroute edges(?)

      if (links[pageName]) {
        links[newPageName] = links[pageName];
        delete links[pageName];
      }
    }

    pageName = newPageName;
  }

  if (!links[pageName]) {
    //todo: keep track of redirects and check if a link here is redirected(? do I need this?)
    links[pageName] = data.links.map(e => e = String(e["*"]));
  }

  links[pageName].forEach((link, i) => {
    if (nodes._data[link]) {
      addNodeAndLink(pageName, link);
      links[pageName].splice(i, 1);
    }
  })

  console.log("checking other nodes to see if they have", pageName, "in their links")
  Object.keys(nodes._data).forEach((nodeName) => {
    console.log("checking if", nodeName, "has", pageName, "should link:", links[nodeName].includes(pageName));
    if (links[nodeName].includes(pageName)) {
      addNodeAndLink(nodeName, pageName);

      links[nodeName].splice(links[nodeName].indexOf(pageName), 1);
      nodes.update({id: nodeName, label: nodeName + ' (' + links[nodeName].length + ')'})
    }
  })

  //todo: also search for links in common (ipod & zero-configuration networking => apple inc)

  nodes.update({id: pageName, label: pageName + ' (' + links[pageName].length + ')'})
}

async function getLinks(pageName) {
  const response = await fetch("https://en.wikipedia.org/w/api.php?action=parse&redirects&prop=links&format=json&origin=*&page=" + encodeURIComponent(pageName));
  const data = await response.json();

  return data.parse;
}

//right-click menu to show links, pick from it
