package org.openmrs.module.attachments.rest;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.apache.commons.beanutils.PropertyUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openmrs.Obs;
import org.openmrs.module.attachments.AttachmentsConstants;
import org.openmrs.module.attachments.obs.TestHelper;
import org.openmrs.module.webservices.rest.web.v1_0.controller.MainResourceControllerTest;
import org.springframework.beans.factory.annotation.Autowired;

public class AttachmentRestController2_xTest extends MainResourceControllerTest {
	
	@Autowired
	private TestHelper testHelper;
	
	private Obs obs;
	
	@Before
	public void setup() throws Exception {
		testHelper.init();
		obs = testHelper.getTestComplexObs();
	}
	
	@After
	public void tearDown() throws IOException {
		testHelper.tearDown();
	}
	
	@Override
	public String getURI() {
		return AttachmentsConstants.ATTACHMENT_URI;
	}
	
	@Override
	public String getUuid() {
		return obs.getUuid();
	}
	
	@Override
	public long getAllCount() {
		return 0;
	}
	
	@Override
	@Test
	public void shouldGetAll() {
	}
	
	@Override
	@Test
	public void shouldGetDefaultByUuid() {
	}
	
	@Override
	@Test
	public void shouldGetRefByUuid() {
	}
	
	@Override
	@Test
	public void shouldGetFullByUuid() {
	}
	
	@Test
	public void postAttachment_shouldUpdateObsComment() throws Exception {
		// Setup
		String editedComment = "Hello world!";
		String json = "{\"uuid\":\"" + getUuid() + "\",\"comment\":\"" + editedComment + "\"}";
		
		// Replay
		Object att = deserialize(handle(newPostRequest(getURI() + "/" + getUuid(), json)));
		
		// Verif
		String comment = (String) PropertyUtils.getProperty(att, "comment");
		assertEquals(editedComment, comment);
	}
	
}
