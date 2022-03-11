
import React, { useEffect, useCallback } from 'react'
import { IframeCommunication } from './lib/iframe'
import { entriesToObj } from './lib/object'

function BlogCommentFrame({
  commentDeployUrlHost,
  pageId
}) {
  const IFRAME_ID = 'comment-iframe' + commentDeployUrlHost + pageId
  useEffect(() => {
    IframeCommunication.init(
      (evt) => {
        onIframeLoaded()
        document.getElementById(IFRAME_ID).style.height = Number(evt.srcElement.outerHeight) + 100 + 'px'
      }
    )
    const PARENT_GITHUB_AUTH_MSG_START = 'PARENT_GITHUB_AUTH_MSG_START'
    IframeCommunication.listenIframe(
      PARENT_GITHUB_AUTH_MSG_START,
      (evt, data) => {
        const {
          github_auth_clientid,
          commentDeployUrlHost,
          callbackUrl
        } = data
        const url = `https://github.com/login/oauth/authorize?client_id=${github_auth_clientid}`
          + (
            `&redirect_uri=${`${commentDeployUrlHost}/api/githubLoginCallback?redirect_url=` + encodeURIComponent(callbackUrl || window.location.href)}`
          )
        window.location.href = url
      }
    )
  }, [])

  const onIframeLoaded = useCallback(
    () => {
      const {
        userHomeUrl,
        auth_username,
        auth_avatar,
        auth_token,
        github_userid
      } = entriesToObj(document.location.search.slice(1), '&')
      document.getElementById(IFRAME_ID).contentWindow.postMessage(
        JSON.stringify({
          msg: 'forward-github-auth-info',
          data: {
            userHomeUrl,
            auth_username,
            auth_avatar,
            auth_token,
            github_userid
          }
        }),
        '*'
      )
    },
    []
  )

  return (
    <div className="App">
      <iframe
        src={`${commentDeployUrlHost}/?articleId=${pageId}`}
        // onLoad={onIframeLoaded}
        id={IFRAME_ID}
        style={{
          width: '100%',
          border: '0px',
          scrollbarWidth: 'none',
          paddingBottom: '30px'
        }}
        frameBorder='0'
      />
    </div>
  );
}
export default BlogCommentFrame

