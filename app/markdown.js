'use strict'

const md = require('markdown-it')
const hljs = require('highlight.js')
const cheerio = require('cheerio')

const mdContainer = require('markdown-it-container')
const mdAnchor = require('markdown-it-anchor')

/*
const mdEmoji = require('markdown-it-emoji')
const mdTaskLists = require('markdown-it-task-lists')
const mdAbbr = require('markdown-it-abbr')
const mdFootnote = require('markdown-it-footnote')
const mdExternalLinks = require('markdown-it-external-links')
const mdAttrs = require('markdown-it-attrs')
const mdExpandTabs = require('markdown-it-expand-tabs')
*/

const _ = require('lodash')
const mdRemove = require('remove-markdown')

// containers correspondances
const containers = [
    {name: "info", entry:'<blockquote class="info"><p class="title">ℹ Note</p>', exit: '</blockquote>\n'},
    {name: "warning", entry:'<blockquote class="warning"><p class="title">⚠️ Warning</p>', exit: '</blockquote>\n'},
    {name: "danger", entry:'<blockquote class="danger"><p class="title">❗ Danger</p>', exit: '</blockquote>\n'}
];

// Load plugins

var mkdown = md({
  html: true,
  breaks: true,
  linkify: true,
  typography: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>'
      } catch (err) {
        return '<pre><code>' + str + '</code></pre>'
      }
    }
    return '<pre><code>' + str + '</code></pre>'
  }
})
.use(mdAnchor, {
  slugify: _.kebabCase,
  permalink: true,
  permalinkClass: 'toc-anchor icon-link2',
  permalinkSymbol: ''
})
  
for (let k in containers){
  const container = containers[k];
  mkdown.use(mdContainer, container.name, {  
      render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
              return container.entry+"\n"; 
          } else { 
              return container.exit+"\n";
          }
      }
  });
}

/*
  .use(mdEmoji)
  .use(mdTaskLists)
  .use(mdAbbr)
  .use(mdFootnote)
  .use(mdExternalLinks, {
    externalClassName: 'external-link',
    internalClassName: 'internal-link'
  })
  .use(mdExpandTabs, {
    tabWidth: 4
  })
  .use(mdAttrs);
*/

// Rendering rules
/*
mkdown.renderer.rules.emoji = function (token, idx) {
  return '<i class="twa twa-' + _.replace(token[idx].markup, /_/g, '-') + '"></i>'
}
*/

// Video rules

const videoRules = [
  {
    selector: 'a.youtube',
    regexp: new RegExp(/(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/i),
    output: '<iframe width="640" height="360" src="https://www.youtube.com/embed/{0}?rel=0" frameborder="0" allowfullscreen></iframe>'
  },
  {
    selector: 'a.vimeo',
    regexp: new RegExp(/vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/i),
    output: '<iframe src="https://player.vimeo.com/video/{0}" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  },
  {
    selector: 'a.dailymotion',
    regexp: new RegExp(/(?:dailymotion\.com(?:\/embed)?(?:\/video|\/hub)|dai\.ly)\/([0-9a-z]+)(?:[-_0-9a-zA-Z]+(?:#video=)?([a-z0-9]+)?)?/i),
    output: '<iframe width="640" height="360" src="//www.dailymotion.com/embed/video/{0}?endscreen-enable=false" frameborder="0" allowfullscreen></iframe>'
  },
  {
    selector: 'a.video',
    regexp: false,
    output: '<video width="640" height="360" controls preload="metadata"><source src="{0}" type="video/mp4"></video>'
  }
]

/**
 * Parse markdown content and build TOC tree
 *
 * @param      {(Function|string)}  content  Markdown content
 * @return     {Array}             TOC tree
 */
const parseTree = (content) => {
  
  content = content.replace(/<!--(.|\t|\n|\r)*?-->/g, '')
  let tokens = md().parse(content, {})
  let tocArray = []

  // -> Extract headings and their respective levels

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_close') {
      continue
    }

    const heading = tokens[i - 1]
    const headingclose = tokens[i]

    if (heading.type === 'inline') {
      let content = ''
      let anchor = ''
      if (heading.children && heading.children.length > 0 && heading.children[0].type === 'link_open') {
        content = mdRemove(heading.children[1].content)
        anchor = _.kebabCase(content)
        anchor = content
      } else {
        content = mdRemove(heading.content)
        anchor = _.kebabCase(heading.children.reduce((acc, t) => acc + t.content, ''))
        anchor = heading.children.reduce((acc, t) => acc + t.content, '')
      }

      tocArray.push({
        content,
        anchor,
        level: +headingclose.tag.substr(1, 1)
      })
    }
  }

  // -> Exclude levels deeper than 2

  _.remove(tocArray, (n) => { return n.level > 2 })

  // -> Build tree from flat array

  return _.reduce(tocArray, (tree, v) => {
    let treeLength = tree.length - 1
    if (v.level < 2) {
      tree.push({
        content: v.content,
        anchor: v.anchor,
        nodes: []
      })
    } else {
      let lastNodeLevel = 1
      let GetNodePath = (startPos) => {
        lastNodeLevel++
        if (_.isEmpty(startPos)) {
          startPos = 'nodes'
        }
        if (lastNodeLevel === v.level) {
          return startPos
        } else {
          return GetNodePath(startPos + '[' + (_.at(tree[treeLength], startPos).length - 1) + '].nodes')
        }
      }
      let lastNodePath = GetNodePath()
      let lastNode = _.get(tree[treeLength], lastNodePath)
      if (lastNode) {
        lastNode.push({
          content: v.content,
          anchor: v.anchor,
          nodes: []
        })
        _.set(tree[treeLength], lastNodePath, lastNode)
      }
    }
    return tree
  }, [])
}

/**
 * Parse markdown content to HTML
 *
 * @param      {String}    content  Markdown content
 * @return     {Promise<String>} Promise
 */
const parseContent = (content) => {
  let cr = cheerio.load(mkdown.render(content))

  if (cr.root().children().length < 1) {
    return ''
  }

  // Replace internal links to add a /read before them
  cr("a").each(function(i, ele) {
    const fragments = ele.attribs.href.split("#");
    const ref = fragments[0];
    if (ref[0] === "/" && ref.endsWith(".md")){
      ele.attribs.href = "/read"+ref+(fragments.length > 1 ? "#"+fragments[1] : "");
    }
  });
    
  // -> Check for empty first element

  let firstElm = cr.root().children().first()[0]
  if (firstElm.type === 'tag' && firstElm.name === 'p') {
    let firstElmChildren = firstElm.children
    if (firstElmChildren.length < 1) {
      firstElm.remove()
    } else if (firstElmChildren.length === 1 && firstElmChildren[0].type === 'tag' && firstElmChildren[0].name === 'img') {
      cr(firstElm).addClass('is-gapless')
    }
  }

  // -> Remove links in headers

  cr('h1 > a:not(.toc-anchor), h2 > a:not(.toc-anchor), h3 > a:not(.toc-anchor)').each((i, elm) => {
    let txtLink = cr(elm).text()
    cr(elm).replaceWith(txtLink)
  })

  // -> Re-attach blockquote styling classes to their parents

  cr('blockquote').each((i, elm) => {
    if (cr(elm).children().length > 0) {
      let bqLastChild = cr(elm).children().last()[0]
      let bqLastChildClasses = cr(bqLastChild).attr('class')
      if (bqLastChildClasses && bqLastChildClasses.length > 0) {
        cr(bqLastChild).removeAttr('class')
        cr(elm).addClass(bqLastChildClasses)
      }
    }
  })

  // -> Enclose content below headers

  cr('h2').each((i, elm) => {
    let subH2Content = cr(elm).nextUntil('h1, h2')
    cr(elm).after('<div class="indent-h2"></div>')
    let subH2Container = cr(elm).next('.indent-h2')
    _.forEach(subH2Content, (ch) => {
      cr(subH2Container).append(ch)
    })
  })

  cr('h3').each((i, elm) => {
    let subH3Content = cr(elm).nextUntil('h1, h2, h3')
    cr(elm).after('<div class="indent-h3"></div>')
    let subH3Container = cr(elm).next('.indent-h3')
    _.forEach(subH3Content, (ch) => {
      cr(subH3Container).append(ch)
    })
  })

  // Replace video links with embeds

  _.forEach(videoRules, (vrule) => {
    cr(vrule.selector).each((i, elm) => {
      let originLink = cr(elm).attr('href')
      if (vrule.regexp) {
        let vidMatches = originLink.match(vrule.regexp)
        if ((vidMatches && _.isArray(vidMatches))) {
          vidMatches = _.filter(vidMatches, (f) => {
            return f && _.isString(f)
          })
          originLink = _.last(vidMatches)
        }
      }
      let processedLink = _.replace(vrule.output, '{0}', originLink)
      cr(elm).replaceWith(processedLink)
    })
  })

  // Apply align-center to parent

  cr('img.align-center').each((i, elm) => {
    cr(elm).parent().addClass('align-center')
    cr(elm).removeClass('align-center')
  })

  return Promise.resolve(cr.html())
}

/**
 * Parse meta-data tags from content
 *
 * @param      {String}  content  Markdown content
 * @return     {Object}  Properties found in the content and their values
 */
const parseMeta = (content) => {
  let commentMeta = new RegExp('<!-- ?([a-zA-Z]+):(.*)-->', 'g')
  let results = {}
  let match
  while ((match = commentMeta.exec(content)) !== null) {
    results[match[1].toLowerCase()] = match[2].trim()
  }

  return results
}

module.exports = {

  /**
   * Parse content and return all data
   *
   * @param      {String}  content  Markdown-formatted content
   * @return     {Object}  Object containing meta, html and tree data
   */
  parse(content) {
    return parseContent(content).then(html => {
      return {
        meta: parseMeta(content),
        html,
        tree: parseTree(content)
      }
    })
  },

  parseContent,
  parseMeta,
  parseTree

}