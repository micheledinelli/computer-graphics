function generateTableOfContents(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const headings = doc.querySelectorAll("h3, h4, h5, h6");
  const toc = [];

  headings.forEach((heading) => {
    const text = heading.textContent;
    const id = heading.id || text.toLowerCase().replace(/\s+/g, "-");

    toc.push({
      text,
      id,
    });
  });

  return toc;
}

function renderTableOfContents(toc) {
  let html = "<ul>";

  toc.forEach((item) => {
    html += `<li><a href="#${item.id}">${item.text}</a></li>`;
  });

  html += "</ul>";
  return html;
}

// Browser version: Using fetch to read index.html
function generateTOCFromFile() {
  fetch("index.html")
    .then((response) => response.text())
    .then((htmlContent) => {
      const toc = generateTableOfContents(htmlContent);
      const tocHtml = renderTableOfContents(toc);
      console.log(tocHtml);
      document.getElementById("toc").innerHTML = tocHtml;

      document.querySelectorAll("#toc a").forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href").substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      });
    })
    .catch((error) => console.error("Error loading index.html:", error));
}

// Call the function to generate TOC
generateTOCFromFile();
