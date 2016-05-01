package it.eng.spagobi.tools.alert.dao;

import it.eng.spago.error.EMFUserError;
import it.eng.spagobi.commons.dao.AbstractHibernateDAO;
import it.eng.spagobi.commons.dao.DAOFactory;
import it.eng.spagobi.commons.dao.SpagoBIDOAException;
import it.eng.spagobi.tools.alert.bo.Alert;
import it.eng.spagobi.tools.alert.bo.AlertAction;
import it.eng.spagobi.tools.alert.bo.AlertListener;
import it.eng.spagobi.tools.alert.listener.IAlertListener;
import it.eng.spagobi.tools.alert.metadata.SbiAlert;
import it.eng.spagobi.tools.alert.metadata.SbiAlertAction;
import it.eng.spagobi.tools.alert.metadata.SbiAlertListener;
import it.eng.spagobi.tools.alert.metadata.SbiAlertLog;
import it.eng.spagobi.tools.scheduler.dao.ISchedulerDAO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AlertDAOImpl extends AbstractHibernateDAO implements IAlertDAO {

	static final List<Alert> mockAlerts = new ArrayList<>();
	private static final String ALERT_JOB_GROUP = "ALERT_JOB_GROUP";

	@Override
	public List<AlertListener> listListener() {
		List<SbiAlertListener> lst = list(SbiAlertListener.class);
		List<AlertListener> ret = new ArrayList<>();
		for (SbiAlertListener sbiAlertListener : lst) {
			ret.add(from(sbiAlertListener));
		}
		return ret;
	}

	private AlertListener from(SbiAlertListener sbiAlertListener) {
		AlertListener alertListener = new AlertListener();
		alertListener.setId(sbiAlertListener.getId());
		alertListener.setName(sbiAlertListener.getName());
		alertListener.setClassName(sbiAlertListener.getClassName());
		alertListener.setTemplate(sbiAlertListener.getTemplate());
		return alertListener;
	}

	@Override
	public List<AlertAction> listAction() {
		List<SbiAlertAction> lst = list(SbiAlertAction.class);
		List<AlertAction> ret = new ArrayList<>();
		for (SbiAlertAction sbiAlertAction : lst) {
			ret.add(from(sbiAlertAction));
		}
		return ret;
	}

	private AlertAction from(SbiAlertAction sbiAlertAction) {
		AlertAction alertAction = new AlertAction();
		alertAction.setId(sbiAlertAction.getId());
		alertAction.setName(sbiAlertAction.getName());
		alertAction.setClassName(sbiAlertAction.getClassName());
		alertAction.setTemplate(sbiAlertAction.getTemplate());
		return alertAction;
	}

	@Override
	public AlertListener loadListener(Integer idListener) {
		return from(load(SbiAlertListener.class, idListener));
	}

	@Override
	public AlertAction loadAction(Integer idAction) {
		return from(load(SbiAlertAction.class, idAction));
	}

	@Override
	public Integer insert(Alert alert) {
		Integer id = (Integer) insert(from(alert));
		try {
			String name = "" + id;
			Map<String, String> parameters = new HashMap<>();
			parameters.put(IAlertListener.LISTENER_PARAMS, alert.getJsonOptions());
			ISchedulerDAO schedulerDAO = DAOFactory.getSchedulerDAO();
			schedulerDAO.createOrUpdateJobAndTrigger(name, Class.forName(alert.getAlertListener().getClassName()), ALERT_JOB_GROUP, ALERT_JOB_GROUP,
					alert.getFrequency(), parameters);
		} catch (EMFUserError | ClassNotFoundException e) {
			throw new SpagoBIDOAException(e);
		}
		return id;
	}

	private SbiAlert from(Alert alert) {
		SbiAlert sbiAlert = new SbiAlert();
		sbiAlert.setId(alert.getId());
		sbiAlert.setName(alert.getName());
		sbiAlert.setListenerId(alert.getAlertListener().getId());
		sbiAlert.setListenerOptions(alert.getJsonOptions());
		return sbiAlert;
	}

	@Override
	public void update(Alert alert) {
		update(from(alert));
		try {
			String name = "" + alert.getId();
			Map<String, String> parameters = new HashMap<>();
			parameters.put(IAlertListener.LISTENER_PARAMS, alert.getJsonOptions());
			ISchedulerDAO schedulerDAO = DAOFactory.getSchedulerDAO();
			schedulerDAO.createOrUpdateJobAndTrigger(name, Class.forName(alert.getAlertListener().getClassName()), ALERT_JOB_GROUP, ALERT_JOB_GROUP,
					alert.getFrequency(), parameters);
		} catch (EMFUserError | ClassNotFoundException e) {
			throw new SpagoBIDOAException(e);
		}
	}

	@Override
	public List<Alert> listAlert() {
		List<SbiAlert> sbiLst = list(SbiAlert.class);
		List<Alert> ret = new ArrayList<>();
		for (SbiAlert sbiAlert : sbiLst) {
			ret.add(from(sbiAlert));
		}
		return ret;
	}

	private Alert from(SbiAlert sbiAlert) {
		Alert alert = new Alert();
		alert.setId(sbiAlert.getId());
		alert.setJsonOptions(sbiAlert.getListenerOptions());
		alert.setAlertListener(from(sbiAlert.getSbiAlertListener()));
		return alert;
	}

	@Override
	public Alert loadAlert(Integer id) {
		int i = mockAlerts.indexOf(new Alert(id));
		return mockAlerts.get(i);
	}

	@Override
	public void remove(Integer id) {
		int i = mockAlerts.indexOf(new Alert(id));
		mockAlerts.remove(i);
	}

	@Override
	public void insertAlertLog(SbiAlertLog alertLog) {
		insert(alertLog);
	}

}
