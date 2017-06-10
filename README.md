# puppet-apache-parse-rewrites
A simple CLI tool that allows you to parse an Apache config file into yaml for use with Puppet and Hiera

```
apache-parse -h
Usage:
  apache-parse [OPTIONS] [ARGS]

Options:
  -i, --input PATH       Apache configuration file
  -o, --output PATH      Hiera yaml output path. If omitted a file named rewriteRules.yaml is added to the current directory.
  -h, --help             Display help and usage details
```
### Example

Command: `apache-parse -i test.conf -o example.yaml`

Input:
```
<VirtualHost *:443>
  ServerName example.com
  ServerAlias www.example.com

  DocumentRoot "/var/www/example/public"

  <Directory "/var/www/example/public">
    Options -MultiViews
    AllowOverride None
    Require all granted
    PassengerEnabled on
  </Directory>

  ErrorLog "/var/log/apache2/example_ssl_error.log"
  ServerSignature Off
  CustomLog "/var/log/apache2/example_ssl_access.log" combined

  ProxyRequests Off
  ProxyPreserveHost Off
  RewriteEngine On

  RewriteCond %{HTTP_HOST} !^www\.example\.com [NC]
  RewriteRule /(.*) https://www.example.com/$1 [L,R=301]

  RewriteCond %{QUERY_STRING} ^season=1.*$ [NC]
  RewriteRule ^/rick-and-morty$ http://example.com/season-1? [L,NE,R=301]

  RewriteCond %{QUERY_STRING} ^season=2.*$ [NC]
  RewriteRule ^/rick-and-morty$ http://example.com/season-2? [L,NE,R=301]

  RewriteRule ^/rick/?$ https://%{HTTP_HOST}/rick-sanchez [L,NE,R=301]

  RewriteRule ^/morty/?$ https://%{HTTP_HOST}/morty-smith [L,NE,R=301]
  RewriteRule ^/summer/?$ https://%{HTTP_HOST}/summer-smith [L,NE,R=301]

  SSLEngine on
  SSLCertificateFile      "/etc/ssl/crt/snakeoil.crt"
  SSLCertificateKeyFile   "/etc/ssl/key/snakeoil.key"
  SSLCertificateChainFile "/etc/ssl/ca/snakeoil.pem"
  SSLCACertificatePath    "/etc/ssl/ca/"
</VirtualHost>
```

Output:
```
---
  -
    rewrite_cond:
      - "%%{HTTP_HOST} !^www\\.example\\.com [NC]"
    rewrite_rule:
      - "/(.*) https://www.example.com/$1 [L,R=301]"
  -
    rewrite_cond:
      - "%%{QUERY_STRING} ^season=1.*$ [NC]"
    rewrite_rule:
      - "^/rick-and-morty$ http://example.com/season-1? [L,NE,R=301]"
  -
    rewrite_cond:
      - "%%{QUERY_STRING} ^season=2.*$ [NC]"
    rewrite_rule:
      - "^/rick-and-morty$ http://example.com/season-2? [L,NE,R=301]"
  -
    rewrite_rule:
      - "^/rick/?$ https://%%{HTTP_HOST}/rick-sanchez [L,NE,R=301]"
      - "^/morty/?$ https://%%{HTTP_HOST}/morty-smith [L,NE,R=301]"
      - "^/summer/?$ https://%%{HTTP_HOST}/summer-smith [L,NE,R=301]"
```
