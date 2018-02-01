import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Container, Card, CardTitle, CardSubtitle, CardText, Button, CardHeader, CardBody, Row, Col } from 'reactstrap';
import swal from 'sweetalert2';

import Nav from '../../components/Nav';
import JobModal from '../../modals/Job';
import API from '../../utils/API';
import { getCalendarLink } from '../../utils/gcal';

import { showModal, hideModal } from '../../actions';

import './Jobs.css';


class Jobs extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    modal: PropTypes.object.isRequired,
    showModal: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
  }

  state = {
    status: 'loading',
    jobs: [],
    message: '',
  }

  componentDidMount() {
    this.loadJobs();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.modal.status === 'success') {
      this.loadJobs();
    }
  }

  onEdit = (job) => {
    this.props.showModal({ type: 'editJob', job });
  }

  onRemove = (job) => {
    swal({
      title: 'Do you really want to remove this Job?',
      text: `We are going to remove "${job.title}" and this can't be undone. Are you sure?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        API.deleteJob(job._id)
          .then((res) => {
            this.loadJobs();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  loadJobs = () => {
    API.getJobs()
      .then((res) => {
        this.setState({
          status: 'idle',
          jobs: res.data.jobs,
        });
        this.props.hideModal();
      }).catch((err) => {
        this.setState({
          status: 'error',
          message: err.errorMessage,
        });
      });
  }

  render() {
    const { jobs, status, message } = this.state;
    const { uid } = this.props.auth;
    const { username } = this.props.auth;

    return (
      <div className="full-content">
        <Nav />
        <JobModal />
        <Container className="jobPanel p-3 my-4">
        <h1 className="text-center p-3" >Hello, {username}!</h1>
          <h1 className="text-center p-3" >Your Dashboard</h1>
          {
            status === 'error' &&
            <p>{message}</p>
          }
          {
            jobs.map(job => (
              <Card key={Math.random()} className="my-2">
                <CardHeader>
                  <Row>
                    <Col>
                      <CardTitle>{job.title}</CardTitle>
                      <CardSubtitle><a href={job.link} target="_blank">{job.company}</a></CardSubtitle>
                    </Col>
                    {
                      job.uid === uid &&
                      <Col className="ml-auto">
                        <Row className="h-100 justify-content-end align-items-center">
                          <a href={getCalendarLink(job)} target="_blank">
                          <Button
                            className="mx-2"
                            onClick={() => {return false;}}
                            color="success"
                          >
                            Add to calendar
                          </Button>
                          </a>
                          <Button
                            className="mx-2"
                            color="warning"
                            onClick={() => this.onEdit(job)}
                            disabled={status === 'saving'}
                          >
                            Edit
                          </Button>
                          <Button
                            className="mx-2"
                            color="danger"
                            onClick={() => this.onRemove(job)}
                            disabled={status === 'saving'}
                          >
                            Remove
                          </Button>
                        </Row>
                      </Col>
                    }
                  </Row>
                </CardHeader>
                <CardBody>
                  <CardText>{job.notes}</CardText>
                </CardBody>
              </Card>
            ))
          }
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  modal: state.modal,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  showModal,
  hideModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Jobs);
