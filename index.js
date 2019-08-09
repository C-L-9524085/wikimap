const container = document.getElementById('map');
const input = document.getElementById('urlinput');

window.focus(container);

//const links = {};
const links = JSON.parse("{\"Zero-configuration networking\":[\"Category:Articles needing cleanup from December 2010\",\"Category:Cleanup tagged articles without a reason field from December 2010\",\"Category:Wikipedia categories needing cleanup from December 2010\",\"Category:Wikipedia pages needing cleanup from December 2010\",\"Category:Articles with self-published sources from May 2013\",\"Category:Articles with unsourced statements from May 2013\",\"Category:Articles with unsourced statements from February 2016\",\"Category:Articles with unsourced statements from May 2015\",\"Category:Application layer protocols\",\"Category:Internet layer protocols\",\"Category:Link protocols\",\"Category:Transport layer protocols\",\"Template:IPstack\",\"Template:Cleanup/doc\",\".local\",\"APIPA\",\"Address Resolution Protocol\",\"Address autoconfiguration\",\"AllJoyn\",\"Android Jelly Bean\",\"Apache License\",\"AppleTalk\",\"Apple Inc.\",\"Application layer\",\"Arthur van Hoff\",\"Australia\",\"Avahi (software)\",\"BSD\",\"Berkeley Software Distribution\",\"Bonjour (software)\",\"Bonjour Sleep Proxy\",\"Border Gateway Protocol\",\"Broadband\",\"BusyBox\",\"CNAME record\",\"C (programming language)\",\"Cable modem\",\"Chooser (Mac OS)\",\"Computer Browser Service\",\"Computer network\",\"Computer printer\",\"DHCP\",\"DHCP server\",\"Darwin (operating system)\",\"Datagram Congestion Control Protocol\",\"Debian\",\"Devices Profile for Web Services\",\"Digital Living Network Alliance\",\"Digital object identifier\",\"Digital subscriber line\",\"Directory service\",\"Domain Name System\",\"Dynamic Host Configuration Protocol\",\"Ethernet\",\"Explicit Congestion Notification\",\"Fiber Distributed Data Interface\",\"File Transfer Protocol\",\"Germany\",\"HTTPS\",\"Hewlett-Packard\",\"Home theater PC\",\"Hostname\",\"Hypertext Transfer Protocol\",\"IChat\",\"IEEE\",\"IETF\",\"IP address\",\"IPsec\",\"IPv4\",\"IPv4LL\",\"IPv6\",\"Integrated Services Digital Network\",\"Internet Control Message Protocol\",\"Internet Control Message Protocol for IPv6\",\"Internet Engineering Task Force\",\"Internet Group Management Protocol\",\"Internet Message Access Protocol\",\"Internet Protocol\",\"Internet Protocol Suite\",\"Internet layer\",\"Internet protocol suite\",\"Internet service provider\",\"Java (programming language)\",\"LLMNR\",\"Layer 2 Tunneling Protocol\",\"Lightweight Directory Access Protocol\",\"Link-local Multicast Name Resolution\",\"Link-local address\",\"Link layer\",\"Linux\",\"List of DNS record types\",\"Local area network\",\"MAC address\",\"MQTT\",\"Mac OS X 10.1\",\"Mac OS X 10.2\",\"Macintosh\",\"Media Gateway Control Protocol\",\"Medium access control\",\"Messages (Apple)\",\"Microsoft\",\"Multicast DNS\",\"Name Binding Protocol\",\"Name service\",\"Namespace\",\"Neighbor Discovery Protocol\",\"NetBIOS\",\"NetBIOS Name Service\",\"NetBSD\",\"Netherlands\",\"Network News Transfer Protocol\",\"Network Time Protocol\",\"Network address\",\"Network administrator\",\"Network packet\",\"Network router\",\"Network service\",\"Networking protocol\",\"Novell\",\"OS X\",\"Open Network Computing Remote Procedure Call\",\"Open Shortest Path First\",\"Opensource\",\"POSIX\",\"PTR record\",\"Packet forwarding\",\"Peer Name Resolution Protocol\",\"Plain old telephone service\",\"Point-to-Point Protocol\",\"Post Office Protocol\",\"Protocol stack\",\"Python (programming language)\",\"RSA (cryptosystem)\",\"Real-time Transport Protocol\",\"Real Time Streaming Protocol\",\"Request for Comments (identifier)\",\"Resource Reservation Protocol\",\"Resource record\",\"Routing Information Protocol\",\"SOAP\",\"SOHO network\",\"SRV record\",\"Safari (web browser)\",\"Secure Shell\",\"Server Message Block\",\"Service Location Protocol\",\"Service discovery\",\"Session Initiation Protocol\",\"Simple Mail Transfer Protocol\",\"Simple Network Management Protocol\",\"Simple Service Discovery Protocol\",\"Solaris (operating system)\",\"Stream Control Transmission Protocol\",\"Stuart Cheshire\",\"Sun Microsystems\",\"TXT record\",\"Telnet\",\"Transmission Control Protocol\",\"Transport Layer Security\",\"Transport layer\",\"Tunneling protocol\",\"UPnP\",\"Ubuntu (operating system)\",\"Uniform Resource Identifier\",\"Unix\",\"User Datagram Protocol\",\"VoIP\",\"WS-Discovery\",\"Web Services for Devices\",\"Wi-Fi\",\"Wide area network\",\"Windows 98\",\"Windows CE\",\"Windows Internet Name Service\",\"Windows XP\",\"Wireless Zero Configuration\",\"XMPP\",\"DNS service discovery\",\"Wikipedia:Citation needed\",\"Wikipedia:Cleanup\",\"Wikipedia:Manual of Style\",\"Wikipedia:Verifiability\",\"Template talk:IPstack\",\"Help:Maintenance template removal\"]}");
const redirects = {};

var linkList = [];

const nodes = new vis.DataSet([JSON.parse("{\"id\":\"Zero-configuration networking\",\"label\":\"Zero-configuration networking (184)\"}")]);
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

  const targetPageName = network.getNodeAt(e.pointer.DOM);
  //processLinks(e.nodes[0])

  buildLinkList(targetPageName);
  toggleDialogVisibility("linksList");
});

function buildLinkList(pageName) {
  //this'll show duplicates for redirects we haven't checked yet...
  
  //not sure how the observer will react if I just replace the array so ohwell
  while (linkList.length > 0) {
    linkList.pop();
  }

  for (let link of links[pageName]) {
    linkList.push(link);
  }

  linkList.sort()
}

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
    console.log("adding node", nodeName)
    nodes.add({id: nodeName, label: nodeName});
    checkRedirectAndFetchLinksAndShowCount(nodeName);
  } catch(e) {
    console.error("couldn't add node", nodeName, e)
  }
}

function addEdge(from, to) {
  if (from != to) {
    //todo sort to & from alphabetically for the Id
    if (edges._data[from + '_' + to]) {
      edges.update({id: from + '_' + to, arrows: 'to, from'})
    }
    else if (edges._data[to + '_' + from]) {
      edges.update({id: to + '_' + from, arrows: 'to, from'})
    } else {
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
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function checkRedirectAndFetchLinksAndShowCount(pageName) {
  const data = await getLinks(pageName);
  console.log(data);

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
      addEdge(edge.from, newName);
      edges.remove({id: edge.id });
    }
    else if (edge.from === oldName) {
      addEdge(newName, edge.to);
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
//list import
//show nodes in red when no getting no data

function toggleDialogVisibility() {
  const elem = document.getElementById("linksList");

  elem.style.display = elem.style.display === "none" ? "block" : "none";
}

const vue = new Vue({
  el: '#linksList',
  data: { linkList },
  methods: {
    toggleDialogVisibility
  }
})

// https://css-tricks.com/creating-vue-js-component-instances-programmatically/
// https://stackoverflow.com/questions/50150668/how-to-create-vue-js-slot-programatically
// https://stackoverflow.com/questions/45151810/passing-props-with-programmatic-navigation-vue-js