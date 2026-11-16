# UIT S3T — Lab 3 React 19 engineering rules

1. Stack: React 19, Vite, modern ES modules and semantic HTML.
2. Forbidden: legacy ReactDOM.render, class components, defaultProps, keyCode, window.alert, unsanitized HTML.
3. Accessibility: semantic main/section/article; proper heading order; interactive controls have labels; visible focus; accessible status outputs.
4. State: immutable updates; calculate sort/filter projections during render instead of syncing them through effects.
5. Effects: clean up every timer, event listener, asynchronous request and Web Audio resource.
6. Async: AbortController for cancelable work; model UI status explicitly; guard duplicate claim submissions; rollback failed optimistic writes.
7. Performance: React.memo on individual piano keys; stable callback identities and entity keys.
8. Verify at 375px and 1440px, check keyboard control and use React DevTools/Lighthouse for evidence.
