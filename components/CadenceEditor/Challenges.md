## Monaco Editor Integration Challenges

### Bundling and Caching

MonacoEditor component is loaded dynamically, which prevents it from being bundled with other code.
And it's also not being cached, though it might be only dev server problem...
