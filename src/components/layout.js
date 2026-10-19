import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

const Layout = ({ location, title, children }) => {
  const { site } = useStaticQuery(graphql`
    query LayoutQuery {
      site {
        siteMetadata {
          author {
            name
          }
          social {
            twitter
          }
        }
      }
    }
  `)
  const author = site.siteMetadata?.author?.name
  const twitter = site.siteMetadata?.social?.twitter
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()} {author}
        {twitter && (
          <>
            {` · `}
            <a href={`https://twitter.com/${twitter}`}>Twitter</a>
          </>
        )}
        {` · `}
        <a href="/rss.xml">RSS</a>
      </footer>
    </div>
  )
}

export default Layout
