import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { gql, useMutation, useQuery } from "@apollo/client";
import swal from "sweetalert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

interface CommentListProps {
  comments: {
    id: string;
    content: string;
    createdAt: string;
    postId: number; // Assuming you need the postId to link comments
  }[];
  postId: number; // Pass the post ID to which comments belong
}

interface CommentFormData {
  content: string;
}

const CREATE_COMMENT = gql`
  mutation CreateComment($content: String!, $postId: Int!) {
    createComment(content: $content, postId: $postId) {
      id
      content
      createdAt
    }
  }
`;

const GET_EMPLOYEE = gql`
  query getEmployee($id: Int!) {
    getEmployee(id: $id) {
      id
      firstName
      lastName
      age
      phoneNumber
      email
      jobLocation
      createdAt
      posts {
        id
        title
        content
        createdAt
        comments {
          id
          content
          createdAt
        }
      }
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: Int!) {
    deleteComment(id: $commentId)
  }
`;

const CommentList: React.FC<CommentListProps> = ({ comments, postId }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentsState, setCommentsState] = useState([...comments].reverse());
  const { id } = useParams<{ id: string }>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>();

  const {
    loading,
    data: employeeData,
    refetch: refetchEmployee,
  } = useQuery(GET_EMPLOYEE, {
    variables: { id: Number(id) },
    skip: true,
  });

  useEffect(() => {
    // Update comments state when employeeData changes
    if (employeeData && employeeData.employee) {
      setCommentsState(employeeData.employee.comments); // Update state to trigger re-render
    }
  }, [employeeData]);

  const [createComment, { loading: mutationLoading, error: mutationError }] =
    useMutation(CREATE_COMMENT, {
      onCompleted: () => {
        reset();
        setShowCommentModal(false);
        swal("Success", "Comment added successfully", "success");

        refetchEmployee()
          .then(({ data }) => {
            // Get the data from the refetch result
            const comments =
              data.getEmployee.posts.find(
                (post: { id: number }) => post.id === postId
              )?.comments || [];
            const reversedComments = [...comments].reverse();
            setCommentsState(reversedComments); // Update comments here
          })
          .catch((refetchError) => {
            console.error("Error refetching employee data:", refetchError);
          });
      },
      onError: (error) => {
        swal("Error", "Failed to add comment", "error");
        console.error(error);
      },
    });

  const handleAddComment = () => setShowCommentModal(true);

  useEffect(() => {
    const addCommentButton = document.getElementById("add-comment");
    if (addCommentButton) {
      addCommentButton.addEventListener("click", handleAddComment);
    }

    return () => {
      if (addCommentButton) {
        addCommentButton.removeEventListener("click", handleAddComment);
      }
    };
  }, []);

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createComment({ variables: { content: data.content, postId } });
      reset();
      setShowCommentModal(false);
      swal("Success", "Comment added successfully", "success");
    } catch (error) {
      swal("Error", "Failed to add comment", "error");
      console.error(error);
    }
  };

  const [deleteComment, { loading: deleteCommentLoading }] =
    useMutation(DELETE_COMMENT);

  const handleDeleteComment = async (commentId: number) => {
    const willDelete = await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this comment!",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    });

    if (willDelete) {
      try {
        await deleteComment({ variables: { commentId } });
        refetchEmployee()
          .then(({ data }) => {
            // Get the data from the refetch result
            const comments =
              data.getEmployee.posts.find(
                (post: { id: number }) => post.id === postId
              )?.comments || [];
            const reversedComments = [...comments].reverse();
            setCommentsState(reversedComments); // Update comments here
          })
          .catch((refetchError) => {
            console.error("Error refetching employee data:", refetchError);
          });
        swal("Comment Deleted!", { icon: "success" });
      } catch (error) {
        swal("Error deleting comment!", { icon: "error" });
        console.error("Error deleting comment:", error);
      }
    }
  };

  return (
    <Card className="my-3">
      <Card.Header>
        <h2>Comments</h2>
      </Card.Header>
      <Card.Body>
        {/* Loading indicator while fetching, deleting, or creating comments */}
        {loading || deleteCommentLoading || mutationLoading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <ListGroup variant="flush">
            {commentsState.length > 0 ? ( // Conditional rendering based on comment count
              commentsState.map((comment) => (
                <ListGroup.Item key={comment.id}>
                  <Row>
                    <Col className="text-start">{comment.content}</Col>
                    <Col className="text-end">
                      <Badge bg="secondary">
                        {new Date(parseInt(comment.createdAt)).toLocaleString()}
                      </Badge>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-danger ms-2"
                        style={{ cursor: "pointer" }}
                        title="Delete Post"
                        onClick={() => handleDeleteComment(Number(comment.id))}
                      />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>
                <div className="text-center">No comments found</div>
              </ListGroup.Item>
            )}
          </ListGroup>
        )}
      </Card.Body>
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="content">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("content", { required: true })}
              />
              {errors.content && (
                <Form.Text className="text-danger">
                  Comment is required
                </Form.Text>
              )}
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              Add Comment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {mutationError && (
        <div className="text-danger mt-2">
          Error adding comment: {mutationError.message}
        </div>
      )}
    </Card>
  );
};

export default CommentList;
