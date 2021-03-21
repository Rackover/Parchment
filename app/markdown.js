'use strict'

const md = require('markdown-it')
const hljs = require('highlight.js')
const cheerio = require('cheerio')

const mdContainer = require('markdown-it-container');
const mdAnchor = require('markdown-it-anchor');
const mdTable = require('markdown-it-multimd-table');
const mdColor = require('markdown-it-color').colorPlugin;


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
  permalinkClass: 'fa fa-link anchor',
  permalinkSymbol: ''
})
.use(mdTable, {
  multiline:  true,
  rowspan:    true,
  headerless: true,
})
.use(mdColor, {
  inline: true
});
  
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

// Download button
mkdown.use(mdContainer, "download", {  
  validate: function(params) {
    return params.trim().match(/^download\s+(.*)$/);
  },

  render: function (tokens, idx) {
    const m = tokens[idx].info.trim().match(/^download\s+(.*)$/);

    if (m == null){
      return "";
    }

    const contents = m[1];
    const elements = contents.split(" ");
    elements.pop();
    const url = elements.join(" ");

    const fileInfo = wikiContents.fileInfo(url);
    const ext = fileInfo === false ? null : require('path').extname(url).toLowerCase().substring(1);


    let logoClass = "fas fa-file-download";
    let image = "";

    const archiveExts = ["zip", "tar", "gz", "pak", "7z"];
    const executableExts = ["exe"];
    

    if (archiveExts.includes(ext)){
      logoClass = "fas fa-file-archive";
    }
    else if (executableExts.includes(ext)){

      const fs = require('fs');
      const path = require('path');

      let icon64;
      let filePath = path.join(WIKI_PATH, url.replace(/\%20/g, " "));
      let iconPath = filePath.substring(0, filePath.length-ext.length)+".png";
      if (fs.existsSync(iconPath)){
        iconPath = url.substring(0, url.length-ext.length)+".png";
      }
      else{
        iconPath = false;
      }

      // Unused
      if (icon64){
        image = `<img src="data:image/png;base64, ${icon64}" alt="X" />`;
      }

      // Icon with same name as exe + PNG
      else if (iconPath){
        image = `<img src="${iconPath}" alt="X" />`;
      }

      // Just regular file icon
      else{
        logoClass = "fas fa-file-medical-alt";
      }
    }
    else if (fileInfo === false){
      logoClass = "fas fa-question";
    }

    if (fileInfo === false){
      return `
          <blockquote class="download missing">
            <div class="preview ${logoClass}"></div>
            <div>
              <p class="title">${require('path').basename(url)}</p>
              <p>Missing file</p>
            </div>
          </blockquote>\n`;
    }
    else{
      return `
        <a href="${url}" style="text-decoration:none">
          <blockquote class="download">
            <div class="preview ${image.length==0 ? logoClass : ""}">${image}</div>
            <div>
              <p class="title">${fileInfo.name}</p>
              <p>${Math.round(fileInfo.size)} kB</p>
              <p>${fileInfo.lastModified}</p>
            </div>
          </blockquote>
        </a>\n`;
    }

    /*

    if (tokens[idx].nesting === 1) {
      // opening tag
      return `<blockquote class="download"><p class="title">${url}</p>\n`;

    } else {
      // closing tag
      return '</blockquote>\n';
    }

    */
  }
});


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
      } else {
        content = mdRemove(heading.content)
        anchor = _.kebabCase(heading.children.reduce((acc, t) => acc + t.content, ''))
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
/*
  let firstElm = cr.root().children().first()[0]
  if (firstElm.type === 'tag' && firstElm.name === 'p') {
    let firstElmChildren = firstElm.children
    if (firstElmChildren.length < 1) {
      firstElm.remove()
    } else if (firstElmChildren.length === 1 && firstElmChildren[0].type === 'tag' && firstElmChildren[0].name === 'img') {
      cr(firstElm).addClass('is-gapless')
    }
  }

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


  // Replace video links with embeds
*/
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
/*
  cr('img.align-center').each((i, elm) => {
    cr(elm).parent().addClass('align-center')
    cr(elm).removeClass('align-center')
  })
*/
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
