import psycopg2
from Logger import logger
import os
from dotenv import load_dotenv


load_dotenv()
hostname = os.getenv('HOST')       # Host where the PostgreSQL server is running
port = '5432'                # Default PostgreSQL port
database = 'postgres'      # The database name you want to connect to
username = 'postgres'          # Your PostgreSQL username
password = os.getenv('PASSWORD')      # Your PostgreSQL password

if not password:
    raise RuntimeError("PG_PASSWORD environment variable is not set")

# postgresql://rohitsaini:mypassword@127.0.0.1:5432/mydatabase


def create():
    return "Some data created"
# Establish the connection


def create_connection():
    try:
        connection = psycopg2.connect(
            host=hostname,
            port=port,
            dbname=database,
            user=username,
            password=password
        )
        return connection
    except Exception as error:
        logger.info(f"Error: {error}")
        return None

# Create (Insert data into the table)




def create_game_result(result, formal_name, result_date, game_id, code):
    connection = create_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            insert_query = '''
                INSERT INTO "happy-game-result"
                (result, formal_name, result_date, game_id, code)
                VALUES (%s, %s, %s, %s, %s);
            '''
            cursor.execute(
                insert_query,
                (result, formal_name, result_date, game_id, code)
            )
            connection.commit()
            print("Game result inserted successfully.")
            logger.info("Game result inserted successfully.")
            return True

    except Exception as error:
        logger.info(f"Error inserting game result: {error}")
        return False

    finally:
        connection.close()


def find_game_result(result_id=None, formal_name=None, game_id=None, code=None):
    connection = create_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            conditions = []
            params = []

            if result_id:
                conditions.append("id = %s")
                params.append(result_id)

            if formal_name:
                conditions.append("formal_name ILIKE %s")
                params.append(f"%{formal_name}%")

            if game_id:
                conditions.append("game_id = %s")
                params.append(game_id)

            if code:
                conditions.append("code ILIKE %s")
                params.append(f"%{code}%")

            if not conditions:
                return {"error": "No search parameters provided"}

            query = '''
                SELECT *
                FROM "happy-game-result"
                WHERE ''' + " OR ".join(conditions)

            cursor.execute(query, params)
            data = cursor.fetchall()

            if data:
                for row in data:
                    logger.info(
                        f"ID: {row[0]}, Result: {row[1]}, Game ID: {row[4]}"
                    )
                return data
            else:
                logger.info("No game results found.")
                return None

    except Exception as error:
        logger.info(f"Error fetching game results: {error}")
        return None

    finally:
        connection.close()








def get_all_games():
    connection = create_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = '''
                SELECT id, code, formal_name
                FROM games
                ORDER BY formal_name;
            '''
            cursor.execute(query)
            games = cursor.fetchall()

            if games:
                logger.info(f"Fetched {len(games)} games.")
                return games
            else:
                logger.info("No games found.")
                return []

    except Exception as error:
        logger.info(f"Error fetching games: {error}")
        return None

    finally:
        connection.close()
