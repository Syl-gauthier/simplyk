YAML = require('yamljs');

YAML.load('../stormpath_config.yml', function(result)
{
    console.log(result);
});
