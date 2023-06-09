const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const seo = require("eleventy-plugin-seo");
const unpkgInliner = require("eleventy-njk-unpkg-inliner");
const site = require("./src/_data/site.js");

async function imageShortcode(src, cls, alt, sizes) {
  let metadata = await Image(src, {
    widths: [600, 900, 1500],
    formats: ["webp", "jpeg", "png"],
    outputDir: "./public/assets/images/",
  });

  let imageAttributes = {
    class: cls,
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("inline", unpkgInliner);
  eleventyConfig.addPlugin(seo, {
    title: site.title,
    description: site.description,
    url: site.url,
    author: site.author.name,
    twitter: site.author.twitter,
    image: site.image,
  });
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addFilter("jsFile", function (page) {
    return "src" + page.filePathStem + ".js";
  });
  eleventyConfig.addCollection("posts", function (collectionApi) {
    const posts = collectionApi.getFilteredByGlob("src/posts/**/*.md");
    for (let i = 0; i < posts.length; i++) {
      const prevPost = posts[i - 1];
      const nextPost = posts[i + 1];
      posts[i].data["prevPost"] = prevPost;
      posts[i].data["nextPost"] = nextPost;
    }
    return posts;
  });
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addPassthroughCopy("src/assets/images/");
  eleventyConfig.addPassthroughCopy("src/assets/css/");
  eleventyConfig.addPassthroughCopy("src/assets/js/");
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!--more-->",
  });
  eleventyConfig.setBrowserSyncConfig({
    files: ["public/**/*"],
    open: true,
  });
  eleventyConfig.setDataDeepMerge(true);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "public",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
