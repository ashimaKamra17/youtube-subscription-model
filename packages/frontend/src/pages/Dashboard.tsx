import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AuthSession } from "@youtube-subscription-model/shared/src/auth";
import { YouTubeSubscriptions } from "../components/YouTubeSubscriptions";

interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
}

const Container = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 3rem 1rem;
  @media (min-width: 640px) {
    padding: 3rem 1.5rem;
  }
  @media (min-width: 1024px) {
    padding: 3rem 2rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  height: 4rem;
  width: 4rem;
  border-radius: 9999px;
`;

const UserInfo = styled.div``;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`;

const UserEmail = styled.p`
  color: #4b5563;
`;

const Section = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
`;

const InfoList = styled.dl`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.dt`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

const InfoValue = styled.dd`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #111827;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  max-width: 28rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &.primary {
    background-color: #2563eb;
    color: white;
    border: none;
    &:hover {
      background-color: #1d4ed8;
    }
  }

  &.secondary {
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #f9fafb;
    }
  }
`;

export const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/api/auth/login";
            return;
          }
          throw new Error("Failed to fetch user info");
        }

        const session: AuthSession = await response.json();
        setUserInfo(session.user);
      } catch (err) {
        if (
          err instanceof TypeError &&
          err.message.includes("Failed to fetch")
        ) {
          setError(
            "Unable to connect to the server. Please make sure the backend server is running at http://localhost:4000"
          );
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <ButtonGroup>
          <Button href="/api/auth/login" className="primary">
            Login Again
          </Button>
          <Button
            as="button"
            onClick={() => window.location.reload()}
            className="secondary"
          >
            Retry Connection
          </Button>
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  if (!userInfo) {
    return <LoadingContainer>No user information available</LoadingContainer>;
  }

  return (
    <Container>
      <ContentWrapper>
        <Card>
          <UserHeader>
            {userInfo?.picture && (
              <Avatar src={userInfo.picture} alt={userInfo.displayName} />
            )}
            <UserInfo>
              <UserName>{userInfo?.displayName}</UserName>
              <UserEmail>{userInfo?.email}</UserEmail>
            </UserInfo>
          </UserHeader>

          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            <ButtonGroup>
              <Button href="/mcp-dashboard" className="primary">
                View MCP Dashboard
              </Button>
              <Button href="/chat" className="secondary">
                Chat with AI Assistant
              </Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>Your YouTube Subscriptions</SectionTitle>
            <YouTubeSubscriptions />
          </Section>
        </Card>
      </ContentWrapper>
    </Container>
  );
};
