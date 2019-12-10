A map to explore wikipedia's articles interconnections. I wrote this because I wanted to see how the rabbit hole I was reading was connected to itself and help me out with deciding what to read, and the other implementations on github weren't doing quite what I had in mind.

You can enter an article's name in the top bar. Click on a node to see the links to other articles it has on the left panel; click on a link to load that article on the map, fetch it's links, and connect articles that link to eachother. Redirections are handled when the article is loaded.

It's still pretty rough. It doesn't parse urls for link inputs, it only uses the english wikipedia, UI is kind of confusing, and there's nothing that handles invalid articles. Pre-seeded with Zero-configuration networking's links to avoid hitting wikipedia's API each time I refresh.
