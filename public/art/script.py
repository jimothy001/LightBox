import urllib2
i = 0
with open("urls2.txt", "r") as f:
    for item in f:
    	line = item.split()
    	resp = urllib2.urlopen(line[0])
    	local_file = open(line[1], "w")
    	local_file.write(resp.read())
    	local_file.close()
    	print line[1]
    	print i
    	i = i+1