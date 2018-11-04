# dns-health

```
(echo -n '[' ;for a in $(cut -f3 -d, majestic_million.csv  | grep \\. | head -1000); 
do echo ./tres $a A; done | parallel -j28  | grep \{  | tr "\n", "," | sed 's/,$/\]/')  > \
~/git/dns-health/result.json 
```

