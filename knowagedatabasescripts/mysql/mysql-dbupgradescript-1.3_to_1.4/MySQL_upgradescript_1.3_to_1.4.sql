ALTER TABLE SBI_META_TABLE_BC
	DROP FOREIGN KEY FK_SBI_META_TABLE_BC_2;
ALTER TABLE SBI_META_TABLE_BC
	ADD CONSTRAINT FK_SBI_META_TABLE_BC_2 FOREIGN KEY (BC_ID) REFERENCES SBI_META_BC (BC_ID) ON DELETE CASCADE;

ALTER TABLE SBI_META_BC
	DROP FOREIGN KEY FK_SBI_META_BC_1;
ALTER TABLE SBI_META_BC
	ADD CONSTRAINT FK_SBI_META_BC_1 FOREIGN KEY (MODEL_ID) REFERENCES SBI_META_MODELS (ID) ON DELETE CASCADE;
	
ALTER TABLE SBI_META_BC_ATTRIBUTE
	DROP FOREIGN KEY FK_SBI_META_BC_ATTRIBUTE_1;
ALTER TABLE SBI_META_BC_ATTRIBUTE
	ADD CONSTRAINT FK_SBI_META_BC_ATTRIBUTE_1 FOREIGN KEY (BC_ID) REFERENCES SBI_META_BC (BC_ID) ON DELETE CASCADE;	
	
ALTER TABLE SBI_META_BC_ATTRIBUTE
	DROP FOREIGN KEY FK_SBI_META_BC_ATTRIBUTE_2;
ALTER TABLE SBI_META_BC_ATTRIBUTE
	ADD CONSTRAINT FK_SBI_META_BC_ATTRIBUTE_2 FOREIGN KEY (COLUMN_ID) REFERENCES SBI_META_TABLE_COLUMN (COLUMN_ID) ON DELETE CASCADE;	
	
ALTER TABLE SBI_META_DS_BC
	DROP FOREIGN KEY FK_SBI_META_DS_BC_2;
ALTER TABLE SBI_META_DS_BC
	ADD CONSTRAINT FK_SBI_META_DS_BC_2 FOREIGN KEY (BC_ID) REFERENCES SBI_META_BC (BC_ID) ON DELETE CASCADE;
	

update SBI_ENGINES set MAIN_URL='/knowagewhatifengine/restful-services/olap/startolap' where LABEL = 'knowageolapengine';
update SBI_ENGINES set MAIN_URL='/knowagewhatifengine/restful-services/olap/startwhatif' where LABEL = 'knowagewhatifengine';
