#Download mysql connector
curl -L -O https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.40.zip

#Unzip downloaded archive
unzip mysql-connector-java-5.1.40.zip

#Install mysql connector bundle on author or change file name to mysql connector location
curl -u admin:admin -F action=install -F bundlestartlevel=20 -F bundlefile=@"mysql-connector-java-5.1.40/mysql-connector-java-5.1.40-bin.jar" http://localhost:4502/system/console/bundles
sleep 3

#Start connector bundle on author
curl -u admin:admin http://localhost:4502/system/console/bundles/com.mysql.jdbc -F action=start

#Install mysql connector bundle on publish or change file name to mysql connector location
curl -u admin:admin -F action=install -F bundlestartlevel=20 -F bundlefile=@"mysql-connector-java-5.1.40/mysql-connector-java-5.1.40-bin.jar" http://localhost:4503/system/console/bundles
sleep 3

#Start connector bundle on publish
curl -u admin:admin http://localhost:4503/system/console/bundles/com.mysql.jdbc -F action=start

# JDBC on author
curl -u admin:admin 'http://localhost:4502/system/console/configMgr/%5BTemporary%20PID%20replaced%20by%20real%20PID%20upon%20save%5D' --data 'apply=true&factoryPid=com.day.commons.datasource.jdbcpool.JdbcPoolService&action=ajaxConfigManager&$location=&jdbc.driver.class=com.mysql.jdbc.Driver&jdbc.connection.uri=jdbc:mysql://localhost:3306/communities?characterEncoding=UTF-8&jdbc.username=root&jdbc.password=&jdbc.validation.query=&default.readonly=false&default.autocommit=true&default.autocommit=false&pool.size=10&pool.max.wait.msec=1000&datasource.name=communities&datasource.svc.properties=&propertylist=jdbc.driver.class,jdbc.connection.uri,jdbc.username,jdbc.password,jdbc.validation.query,default.readonly,default.autocommit,pool.size,pool.max.wait.msec,datasource.name,datasource.svc.properties'

#JDBC on publish
curl -u admin:admin 'http://localhost:4503/system/console/configMgr/%5BTemporary%20PID%20replaced%20by%20real%20PID%20upon%20save%5D' --data 'apply=true&factoryPid=com.day.commons.datasource.jdbcpool.JdbcPoolService&action=ajaxConfigManager&$location=&jdbc.driver.class=com.mysql.jdbc.Driver&jdbc.connection.uri=jdbc:mysql://localhost:3306/communities?characterEncoding=UTF-8&jdbc.username=root&jdbc.password=&jdbc.validation.query=&default.readonly=false&default.autocommit=true&default.autocommit=false&pool.size=10&pool.max.wait.msec=1000&datasource.name=communities&datasource.svc.properties=&propertylist=jdbc.driver.class,jdbc.connection.uri,jdbc.username,jdbc.password,jdbc.validation.query,default.readonly,default.autocommit,pool.size,pool.max.wait.msec,datasource.name,datasource.svc.properties'

#Delete downloaded files
rm -rf ./mysql-*

#Set communities SRP configuration to DSRP on author
curl -u admin:admin -X POST -F 'datasource=communities' -F 'database.name=communities' -F 'zkhost=' -F 'solr.url=http://127.0.0.1:8983/solr/' -F 'solr.collection=collection1' -F 'asipath=/content/usergenerated/asi/rdbms' -F 'type=dsrp' -F 'jcr:primaryType=nt:unstructured' http://localhost:4502/conf/global/settings/community/srpc/defaultconfiguration

#Set communities SRP configuration to DSRP on publish
curl -u admin:admin -X POST -F 'datasource=communities' -F 'database.name=communities' -F 'zkhost=' -F 'solr.url=http://127.0.0.1:8983/solr/' -F 'solr.collection=collection1' -F 'asipath=/content/usergenerated/asi/rdbms' -F 'type=dsrp' -F 'jcr:primaryType=nt:unstructured' http://localhost:4503/conf/global/settings/community/srpc/defaultconfiguration
